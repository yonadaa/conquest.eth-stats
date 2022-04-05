import React, { useEffect, useRef, useState } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";

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

const BLOCK_STEP = 10000;
export const SCALING_FACTOR = 2.25;
export const addressToColor = (address: string) => "#" + address.slice(3, 9);
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

export const PlanetCanvas = ({ planets, space, width, height, currentSpace, condition }: { planets: any[], space: any, width: number, height: number, currentSpace: any, condition: (p: any) => string }) => {
  const canvas = useRef<any>();

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, 10000, 10000)
    context.fillStyle = 'black';
    context.fillRect(0, parseInt(currentSpace.minY) * SCALING_FACTOR, 10000, 1);
    context.fillRect(parseInt(currentSpace.minX) * SCALING_FACTOR, 0, 1, 10000);
    context.strokeStyle = 'grey';

    planets.forEach(p => {
      context.fillStyle = condition(p);
      drawPlanet(context, p, currentSpace)
    })
  }, [planets, currentSpace, space, condition])

  return <canvas ref={canvas} width={width} height={height} style={{ border: "solid" }} />;
}

const PlanetsQueryWrapper = ({ currentBlock, currentSpace, condition }: { currentBlock: number, currentSpace: any, condition: (p: any) => string }) => {
  const [block, setBlock] = useState(currentBlock);

  const { loading, error, data } = useQuery(PLANETS, {
    variables: { block },
  });

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div>
        {!loading && data.space ?
          <PlanetCanvas
            condition={condition}
            planets={data.planets.concat(data.planets2)}
            space={data.space}
            currentSpace={currentSpace}
            width={(currentSpace.minX - (-currentSpace.maxX)) * SCALING_FACTOR}
            height={(currentSpace.minY - (-currentSpace.maxY)) * SCALING_FACTOR}
          /> :
          <canvas width={(currentSpace.minX - (-currentSpace.maxX)) * SCALING_FACTOR} height={(currentSpace.minY - (-currentSpace.maxY)) * SCALING_FACTOR} style={{ border: "solid" }} />}
      </div>
      <div>
        <label htmlFor="customRange1" className="form-label">View at block: {block}</label>
        <input type="range" className="form-range" id="customRange1" min={currentBlock - 500000} max={currentBlock} step={BLOCK_STEP} value={block} onChange={(e) => setBlock(parseInt(e.target.value))}></input>
      </div>
    </div >
  );
}

export const MapBlack = ({ condition }: { condition: (p: any) => string }) => {
  const { loading, error, data } = useQuery(BLOCK);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <PlanetsQueryWrapper currentBlock={data._meta.block.number} currentSpace={data.space} condition={condition} />
    </div>
  );
}

function Map() {
  const [state, setState] = useState(0);

  return (
    <div>
      <button className='btn btn-primary m-1' onClick={() => setState(state === 2 ? 0 : state + 1)}>{state === 0 ? "Showing only owners" : state === 1 ? "Showing only alliances" : "Showing alliance or owner"}</button>
      <MapBlack
        condition={
          state === 0 ?
            ((p: any) => p.owner ? addressToColor(p.owner.id) : 'black') :
            state === 1 ?
              ((p: any) => (p.owner && p.owner.alliances.length > 0) ? addressToColor(p.owner.alliances[0].alliance.id) : 'white') :
              ((p: any) => p.owner ? addressToColor(p.owner && p.owner.alliances.length > 0 ? p.owner.alliances[0].alliance.id : p.owner.id) : 'black')
        } />
    </div>
  );
}

export default Map;
