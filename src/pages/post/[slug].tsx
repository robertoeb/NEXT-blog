import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import * as prismicH from '@prismicio/helpers';
import { useEffect } from 'react';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <div className={commonStyles.container}>
        <Header />
      </div>
      {router.isFallback ? (
        <h1>Carregando...</h1>
      ) : (
        <>
          <img
            className={styles.postBanner}
            src={post.data.banner.url}
            alt="Post banner"
          />
          <div className={commonStyles.container}>
            <main className={styles.contentContainer}>
              <h1>{post.data.title}</h1>
              <div className={styles.postInfos}>
                <time>
                  <FiCalendar />{' '}
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>{' '}
                <span className={styles.author}>
                  <FiUser /> {post.data.author}
                </span>
                <span>
                  <FiClock /> 4 min
                </span>
              </div>
              <article>
                {post.data.content.map((data, index) => (
                  <div key={index}>
                    {data.heading && (
                      <span className={styles.heading}>{data.heading}</span>
                    )}
                    <p
                      className={styles.content}
                      dangerouslySetInnerHTML={{
                        __html: prismicH.asHTML(data.body),
                      }}
                    />
                  </div>
                ))}
              </article>
            </main>
          </div>
        </>
      )}
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      orderings: '[my.post.date desc]',
      fetch: ['post.uid'],
    }
  );

  return {
    paths: posts.results?.map(({ uid }) => ({ params: { slug: uid } })) || [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post },
  };
};
