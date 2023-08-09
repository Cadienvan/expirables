import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Common structures',
    Svg: require('@site/static/img/undraw_task_re_wi3v.svg').default,
    description: (
      <>
      Map, Set, Queue, Stack, and Linked List.
      </>
    ),
  },
  {
    title: 'Zero dependencies',
    Svg: require('@site/static/img/undraw_delivery_truck_vt6p.svg').default,
    description: (
      <>
        No need of third party packages to run.
      </>
    ),
  },
  {
    title: 'Free',
    Svg: require('@site/static/img/undraw_open_source_-1-qxw.svg').default,
    description: (
      <>
      Based on MIT license.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className='row center'>
          <img className='center' width="50%" src={useBaseUrl('/img/expirables.png')}/>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
