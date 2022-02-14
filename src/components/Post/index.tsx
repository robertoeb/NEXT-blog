import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { IPost } from '../../pages';

import styles from './post.module.scss';

interface PostProps {
  post: IPost;
}

function Post({ post }: PostProps) {
  return (
    <div className={styles.posts}>
      <Link href={`/post/${post.uid}`}>
        <a>
          <strong>{post.data.title}</strong>
          <span className={styles.subtitle}>{post.data.subtitle}</span>
          <div>
            <time>
              <FiCalendar />{' '}
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>{' '}
            <span className={styles.author}>
              <FiUser /> {post.data.author}
            </span>
          </div>
        </a>
      </Link>
    </div>
  );
}

export { Post };
