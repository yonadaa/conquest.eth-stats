import React, { useEffect, useRef } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { addressToColor } from './Map';

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

const SCALING_FACTOR = 2.25;

export const drawPlanet = (context: any, planet: any, space: any) => {
  context.beginPath();
  context.arc((planet.x - (- space.minX)) * SCALING_FACTOR, (planet.y - (-space.minY)) * SCALING_FACTOR, SCALING_FACTOR * (planet.stakeDeposited / (10 ** 18) / 20), 0, 2 * Math.PI);
  context.stroke();
  context.fill();
  if (planet.reward > 0) {
    context.strokeStyle = 'black';
    const scale = SCALING_FACTOR * (planet.stakeDeposited / (10 ** 18) / 20);
    context.strokeRect((planet.x - (- space.minX)) * SCALING_FACTOR - scale / 2, (planet.y - (-space.minY)) * SCALING_FACTOR - scale / 2, scale, scale);
    context.strokeStyle = 'grey';
  }
}

const PlanetCanvas = ({ color, planets, space, width, height, condition }: { color: string, planets: any[], space: any, width: number, height: number, condition: (p: any) => boolean }) => {
  const canvas = useRef<any>();

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, 10000, 10000)
    context.fillStyle = 'black';
    context.fillRect(0, ((0 - (- space.minY))) * SCALING_FACTOR, 10000, 1);
    context.fillRect(((0 - (- space.minX))) * SCALING_FACTOR, 0, 1, 10000);
    context.strokeStyle = 'grey';

    planets.forEach(p => {
      context.fillStyle = "black";
      if (condition(p)) {
        context.fillStyle = color;
      }
      drawPlanet(context, p, space)
    })
  }, [planets, space])

  return <canvas ref={canvas} width={width} height={height} style={{ border: "solid" }} />;
}

const MapSingle = ({ color, condition }: { color: string, condition: (p: any) => boolean }) => {
  const { loading, error, data } = useQuery(PLANETS);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {!loading && data.space ?
        <PlanetCanvas condition={condition} color={color} planets={data.planets} space={data.space} width={(data.space.minX - (-data.space.maxX)) * SCALING_FACTOR} height={(data.space.minY - (-data.space.maxY)) * SCALING_FACTOR} /> : null}
    </div>
  );
}

export default MapSingle;
