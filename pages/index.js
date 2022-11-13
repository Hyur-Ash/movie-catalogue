import Head from 'next/head';
import {useContext} from 'react';
import { Context } from '../lib/Context';

export default function Home() {

  const {
    message
  } = useContext(Context);

  return (
    <div className="my-container">
      <Head>
        <title>Hello Hyur</title>
        <meta name="description" content="Created by Hyur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>{message}</h1>

    </div>
  )
}
