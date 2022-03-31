import React from 'react';
import Map from './Map';
import {
  useQuery,
  gql
} from "@apollo/client";

const PLANETS = gql`
  query GetPlanets($orderBy: String) {
    owners(first:1000) {
      id
    }
    alliances(first:1000) {
      id
    }
    planets(first: 1000) {
      id
    }
  }
`

const SpaceQueryWrapper = () => {
  const { loading, error, data } = useQuery(PLANETS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Space overview</h1>
      <p><i>There are at least {data.planets.length} active planets, {data.owners.length} owners, and {data.alliances.length} alliances.</i></p>
      <Map />
    </div>
  );
}

function Home() {
  return (
    <div>
      <SpaceQueryWrapper />
    </div>
  );
}

export default Home;
