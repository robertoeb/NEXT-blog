import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header';
import { Post } from '../components/Post';

export interface IPost {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: IPost[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const formatResponse = response => {
  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    next_page: response.next_page,
    results: posts,
  };
};

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination);

  const handleNextPage = () => {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(jsonData => {
        const { next_page, results } = formatResponse(jsonData);
        const newPosts = {
          next_page,
          results: [...posts.results, ...results],
        };
        setPosts(newPosts);
      });
  };

  return (
    <>
      <Head>
        <title>&lt;/&gt; spacetraveling.</title>
      </Head>
      <div className={commonStyles.container}>
        <Header />
        <main className={styles.contentContainer}>
          {posts.results.map((post: IPost) => (
            <Post key={post.uid} post={post} />
          ))}

          {posts.next_page && (
            <span className={styles.nextPage} onClick={handleNextPage}>
              Carregar mais posts
            </span>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      orderings: '[my.post.date desc]',
      pageSize: 1,
      fetch: ['post.title', 'post.content', 'post.author', 'post.subtitle'],
    }
  );

  const postsPagination = formatResponse(response);

  return { props: { postsPagination } };
};
