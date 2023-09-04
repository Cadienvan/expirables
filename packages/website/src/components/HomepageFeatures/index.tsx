import React from 'react';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

type FeatureItem = {
  title: string;
  Svg: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Common structures',
    Svg: '/img/undraw_task_re_wi3v.svg',
    description: (
      <>
      Map, Set, Queue, Stack, and Linked List.
      </>
    ),
  },
  {
    title: 'Zero dependencies',
    Svg: '/img/undraw_delivery_truck_vt6p.svg',
    description: (
      <>
        No need of third party packages to run.
      </>
    ),
  },
  {
    title: 'Free',
    Svg: '/img/undraw_open_source_-1-qxw.svg',
    description: (
      <>
      Based on MIT license.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={'col col--4'}>
      <div className="text--center">
        <img className={styles.featureSvg} src={useBaseUrl(Svg)}/>
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
