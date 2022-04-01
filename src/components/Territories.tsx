import React, { useEffect, useRef } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { addressToColor } from './Map';

const PLANETS = gql`
  query GetPlanets($block: Int) {
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
    planets2: planets(first: 1000, skip: 1000) {
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

const SCALING_FACTOR = 3;
const BASE_PLANET_SIZE = 40;
const STEP = 2;
const MAX_DISTANCE = 10;
const distance = (a: any, b: any) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const drawPlanet = (context: any, planet: any, space: any) => {
  if (planet.owner) {
    context.fillStyle = addressToColor(planet.owner.id);
  }
  context.beginPath();
  context.arc((planet.x - (- space.minX)) * SCALING_FACTOR, (planet.y - (-space.minY)) * SCALING_FACTOR, SCALING_FACTOR * (planet.stakeDeposited / (10 ** 18) / BASE_PLANET_SIZE), 0, 2 * Math.PI);
  context.stroke();
  context.fill();
  if (planet.reward > 0) {
    context.strokeStyle = 'black';
    const scale = SCALING_FACTOR * (planet.stakeDeposited / (10 ** 18) / BASE_PLANET_SIZE);
    context.strokeRect((planet.x - (- space.minX)) * SCALING_FACTOR - scale / 2, (planet.y - (-space.minY)) * SCALING_FACTOR - scale / 2, scale, scale);
  }
}

const NearestNeighbourCanvas = ({ planets, space }: { planets: any[], space: any }) => {
  const canvas = useRef<any>();

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, 10000, 10000)
    if (planets) {
      for (let x = -space.minX; x < space.maxX; x += STEP) {
        for (let y = -space.minY; y < space.maxY; y += STEP) {
          const ps = planets.slice();
          ps.sort((p1, p2) => distance({ x, y }, p1) - distance({ x, y }, p2));

          if (distance({ x, y }, ps[0]) < MAX_DISTANCE) {
            if (!ps[0].owner) {
              context.fillStyle = 'black';
            } else if (ps[0].owner.alliances.length > 0) {
              context.fillStyle = addressToColor(ps[0].owner.alliances[0].alliance.id);
            } else {
              context.fillStyle = addressToColor(ps[0].owner.id);
            }
            context.beginPath();
            context.arc((x - (- space.minX)) * SCALING_FACTOR, (y - (-space.minY)) * SCALING_FACTOR, SCALING_FACTOR * STEP, 0, 2 * Math.PI);
            context.fill();
          }
        }
      }
      context.fillStyle = 'black';
      context.fillRect(0, ((0 - (- space.minY))) * SCALING_FACTOR, 10000, 0.25);
      context.fillRect(((0 - (- space.minX))) * SCALING_FACTOR, 0, 0.25, 10000);
      planets.forEach(p => {
        drawPlanet(context, p, space)
      })
    }
  }, [planets, space])

  return <canvas ref={canvas} width={(space.minX - (-space.maxX)) * SCALING_FACTOR} height={(space.minY - (-space.maxY)) * SCALING_FACTOR} style={{ border: "solid" }} />;
}

const PlanetsQueryWrapper = () => {
  const { loading, error, data } = useQuery(PLANETS);

  if (loading) return <p>Loading..</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {data.space ?
        <NearestNeighbourCanvas planets={data.planets.concat(data.planets2)} space={data.space} /> :
        <canvas width={(data.space.minX - (-data.space.maxX)) * SCALING_FACTOR} height={(data.space.minY - (-data.space.maxY)) * SCALING_FACTOR} style={{ border: "solid" }} />}
    </div >
  );
}

function Territories() {
  return (
    <div>
      <h2>Faction Territories</h2>
      <PlanetsQueryWrapper />
    </div>
  );
}

export default Territories;
