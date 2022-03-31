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

const SCALING_FACTOR = 3;
const BLOCK_STEP = 3000;

export const addressToColor = (address: string) => "#" + address.slice(3, 9);

const drawPlanet = (context: any, planet: any, space: any) => {
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

const drawOwner = (context: any, planets: any[], space: any) => {
  planets.forEach(p => {
    if (p.owner) {
      context.fillStyle = addressToColor(p.owner.id)
      drawPlanet(context, p, space)
    }
  })
};

const drawAlliance = (context: any, planets: any[], space: any) => {
  planets.forEach(p => {
    if (p.owner && p.owner.alliances.length > 0) {
      context.fillStyle = addressToColor(p.owner.alliances[0].alliance.id)
      drawPlanet(context, p, space)
    }
  })
};

const drawAllianceOrOwner = (context: any, planets: any[], space: any) => {
  planets.forEach(p => {
    if (p.owner) {
      context.fillStyle = addressToColor(p.owner && p.owner.alliances.length > 0 ? p.owner.alliances[0].alliance.id : p.owner.id);
      drawPlanet(context, p, space)
    }
  })
};

const PlanetCanvas = ({ planets, space, state, width, height, currentSpace }: { planets: any[], space: any, state: number, width: number, height: number, currentSpace: any }) => {
  const canvas = useRef<any>();

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, 10000, 10000)
    context.fillStyle = 'black';
    context.fillRect(0, ((0 - (- space.minY))) * SCALING_FACTOR, 10000, 1);
    context.fillRect(((0 - (- space.minX))) * SCALING_FACTOR, 0, 1, 10000);
    context.strokeStyle = 'grey';

    if (planets) {
      if (state === 0) {
        drawOwner(context, planets, currentSpace);
      } else if (state === 1) {
        drawAlliance(context, planets, currentSpace);
      } else {
        drawAllianceOrOwner(context, planets, currentSpace);
      }
    }
  }, [planets, state, currentSpace, space])

  return <canvas ref={canvas} width={width} height={height} style={{ border: "solid" }} />;
}

const PlanetsQueryWrapper = ({ currentBlock, currentSpace }: { currentBlock: number, currentSpace: any }) => {
  const [state, setState] = useState(0);
  const [block, setBlock] = useState(currentBlock);

  const { loading, error, data } = useQuery(PLANETS, {
    variables: { block },
  });

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <button className='btn btn-primary m-1' onClick={() => setState(state === 2 ? 0 : state + 1)}>{state === 0 ? "Showing only owners" : state === 1 ? "Showing only alliances" : "Showing alliance or owner"}</button>
      <div>
        {!loading && data.space ?
          <PlanetCanvas planets={data.planets.concat(data.planets2)} space={data.space} currentSpace={currentSpace} state={state} width={(currentSpace.minX - (-currentSpace.maxX)) * SCALING_FACTOR} height={(currentSpace.minY - (-currentSpace.maxY)) * SCALING_FACTOR} /> :
          <canvas width={(currentSpace.minX - (-currentSpace.maxX)) * SCALING_FACTOR} height={(currentSpace.minY - (-currentSpace.maxY)) * SCALING_FACTOR} style={{ border: "solid" }} />}
      </div>
      <div>
        <label htmlFor="customRange1" className="form-label">View at block: {block}</label>
        <input type="range" className="form-range" id="customRange1" min={currentBlock - 100000} max={currentBlock} step={BLOCK_STEP} value={block} onChange={(e) => setBlock(parseInt(e.target.value))}></input>
      </div>
    </div >
  );
}

function Map() {
  const { loading, error, data } = useQuery(BLOCK);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <PlanetsQueryWrapper currentBlock={data._meta.block.number} currentSpace={data.space} />
    </div>
  );
}

export default Map;
