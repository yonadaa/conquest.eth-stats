import React from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { PlanetCanvas, SCALING_FACTOR } from './Map';

const PLANETS = gql`
  query  {
    space(id:"Space") {
      minX
      maxX
      minY
      maxY
    }
    planets(first: 1000) {
      id
      x
      y
      stakeDeposited
      reward
      owner {
        id
        alliances {
          alliance {
            id
          }
        }
      }
    }
  }
`

const MapSingle = ({ condition }: { condition: (p: any) => string }) => {
  const { loading, error, data } = useQuery(PLANETS);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {!loading && data.space ?
        <PlanetCanvas condition={condition} planets={data.planets} space={data.space} currentSpace={data.space} width={(data.space.minX - (-data.space.maxX)) * SCALING_FACTOR} height={(data.space.minY - (-data.space.maxY)) * SCALING_FACTOR} /> : null}
    </div>
  );
}

export default MapSingle;
