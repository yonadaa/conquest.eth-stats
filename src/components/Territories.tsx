import React, { useEffect, useRef, useState } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { addressToColor, BLOCK_STEP, FIRST_BLOCK } from './Map';

const BLOCK = gql`
  query {
    _meta{
      block {
        number
      }
    }
    space(id:"Space") {
      minX
      maxX
      minY
      maxY
    }
  }
`

const PLANETS = gql`
  query GetPlanets($block: Int) {
    space(id:"Space", block:{number: $block}) {
      minX
      maxX
      minY
      maxY
    }
    planets(first: 1000, block:{number: $block}) {
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
    planets2: planets(first: 1000, skip:1000, block:{number: $block}) {
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

const SCALING_FACTOR = 6;
const BASE_PLANET_DIVISOR = 15;
const STEP = 2;
const MAX_DISTANCE = 10;
const distance = (a: any, b: any) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const drawPlanet = (context: any, planet: any, space: any) => {
  if (planet.owner) {
    context.fillStyle = addressToColor(planet.owner.id);
  }
  context.beginPath();
  context.arc((planet.x - (- space.minX)) * SCALING_FACTOR, (planet.y - (-space.minY)) * SCALING_FACTOR, SCALING_FACTOR * (planet.stakeDeposited / (10 ** 18) / BASE_PLANET_DIVISOR), 0, 2 * Math.PI);
  context.stroke();
  context.fill();
  if (planet.reward > 0) {
    context.strokeStyle = 'black';
    const scale = SCALING_FACTOR * (planet.stakeDeposited / (10 ** 18) / BASE_PLANET_DIVISOR);
    context.strokeRect((planet.x - (- space.minX)) * SCALING_FACTOR - scale / 2, (planet.y - (-space.minY)) * SCALING_FACTOR - scale / 2, scale, scale);
  }
}

const NearestNeighbourCanvas = ({ planets, currentSpace }: { planets: any[], currentSpace: any }) => {
  const canvas = useRef<any>();

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, 10000, 10000)
    if (planets) {
      for (let x = -currentSpace.minX; x < currentSpace.maxX; x += STEP) {
        for (let y = -currentSpace.minY; y < currentSpace.maxY; y += STEP) {
          const closestPlanet = planets.reduce((prev: any, curr: any) => distance({ x, y }, prev) < distance({ x, y }, curr) ? prev : curr);

          if (distance({ x, y }, closestPlanet) < MAX_DISTANCE) {
            if (!closestPlanet.owner) {
              context.fillStyle = 'black';
            } else if (closestPlanet.owner.alliances.length > 0) {
              context.fillStyle = addressToColor(closestPlanet.owner.alliances[0].alliance.id);
            } else {
              context.fillStyle = addressToColor(closestPlanet.owner.id);
            }
            context.beginPath();
            context.arc((x - (- currentSpace.minX)) * SCALING_FACTOR, (y - (-currentSpace.minY)) * SCALING_FACTOR, SCALING_FACTOR * STEP, 0, 2 * Math.PI);
            context.fill();
          }
        }
      }
      context.fillStyle = 'black';
      context.fillRect(0, ((0 - (- currentSpace.minY))) * SCALING_FACTOR, 10000, 0.25);
      context.fillRect(((0 - (- currentSpace.minX))) * SCALING_FACTOR, 0, 0.25, 10000);
      planets.forEach(p => {
        drawPlanet(context, p, currentSpace)
      })
    }
  }, [planets, currentSpace])

  return <canvas ref={canvas} width={(currentSpace.minX - (-currentSpace.maxX)) * SCALING_FACTOR} height={(currentSpace.minY - (-currentSpace.maxY)) * SCALING_FACTOR} style={{ border: "solid" }} />;
}

const PlanetsQueryWrapper = ({ currentBlock, currentSpace }: { currentBlock: number, currentSpace: any }) => {
  const [block, setBlock] = useState(currentBlock);

  const { loading, error, data } = useQuery(PLANETS,
    {
      variables: { block },
      fetchPolicy: 'network-only'
    });

  if (loading) return <p>Loading..</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {data.space ?
        <NearestNeighbourCanvas planets={data.planets.concat(data.planets2)}
          currentSpace={currentSpace} /> :
        <canvas width={(data.space.minX - (-data.space.maxX)) * SCALING_FACTOR} height={(data.space.minY - (-data.space.maxY)) * SCALING_FACTOR} style={{ border: "solid" }} />
      }
      <div>
        <label htmlFor="customRange1" className="form-label">View at block: <a href={`https://blockscout.com/xdai/mainnet/block/${block}`}>{block}</a></label>
        <input type="range" className="form-range" id="customRange1" min={FIRST_BLOCK} max={currentBlock} step={BLOCK_STEP} value={block} onChange={(e) => setBlock(parseInt(e.target.value))}></input>
      </div>
    </div >
  );
}

const MapBlank = () => {
  const { loading, error, data } = useQuery(BLOCK);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <PlanetsQueryWrapper currentBlock={data._meta.block.number} currentSpace={data.space} />
    </div>
  );
}

const Territories = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Faction Territories</h2>
      <MapBlank />
    </div>
  );
}

export default Territories;