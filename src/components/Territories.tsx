import React, { useEffect, useRef, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { addressToColor, BLOCK_STEP } from "./Map";
import { FIRST_BLOCK } from "./constants";

const BLOCK = gql`
  query {
    _meta {
      block {
        number
      }
    }
    space(id: "Space") {
      minX
      maxX
      minY
      maxY
    }
  }
`;

const PLANETS = gql`
  query GetPlanets($block: Int) {
    space(id: "Space", block: { number: $block }) {
      minX
      maxX
      minY
      maxY
    }
    planets(first: 1000, block: { number: $block }) {
      id
      x
      y
      stakeDeposited
      reward
      owner {
        id
      }
    }
    planets2: planets(first: 1000, skip: 1000, block: { number: $block }) {
      id
      x
      y
      stakeDeposited
      reward
      owner {
        id
      }
    }
  }
`;
type Coord = { x: number; y: number };

const BASE_PLANET_DIVISOR = 13;
const SCALING_FACTOR = 6;
const STEP = 0.5;
const MAX_DISTANCE = 10;
const distance = (a: Coord, b: Coord) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const drawPlanet = (context: any, planet: any, space: any) => {
  if (planet.owner) {
    context.fillStyle = addressToColor(planet.owner.id);
  }
  context.beginPath();
  context.arc(
    (planet.x - -space.minX) * SCALING_FACTOR,
    (planet.y - -space.minY) * SCALING_FACTOR,
    SCALING_FACTOR * (planet.stakeDeposited / 10 ** 18 / BASE_PLANET_DIVISOR),
    0,
    2 * Math.PI
  );
  context.stroke();
  context.fill();
  if (planet.reward > 0) {
    context.strokeStyle = "black";
    const scale =
      SCALING_FACTOR * (planet.stakeDeposited / 10 ** 18 / BASE_PLANET_DIVISOR);
    context.strokeRect(
      (planet.x - -space.minX) * SCALING_FACTOR - scale / 2,
      (planet.y - -space.minY) * SCALING_FACTOR - scale / 2,
      scale,
      scale
    );
  }
};

const NearestNeighbourCanvas = ({
  planets,
  space,
}: {
  planets: {
    id: string;
    x: number;
    y: number;
    stakeDeposited: number;
    reward: number;
    owner: {
      id: string;
    };
  }[];
  space: { minX: number; maxX: number; minY: number; maxY: number };
}) => {
  const canvas = useRef<any>();

  useEffect(() => {
    const context = canvas.current.getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, 10000, 10000);
    if (planets && planets.length > 0) {
      for (let x = -space.minX; x < space.maxX; x += STEP) {
        for (let y = -space.minY; y < space.maxY; y += STEP) {
          const coord = { x, y };

          let minId;
          let minDistance = Infinity;
          for (let i = 0; i < planets.length; i++) {
            const planet = planets[i];
            const d = distance(coord, planet);
            if (planet.owner && d < minDistance && d < MAX_DISTANCE) {
              minId = planet.owner.id;
              minDistance = d;
            }
          }

          if (minId) {
            context.fillStyle = addressToColor(minId);
          } else {
            context.fillStyle = "black";
          }

          context.fillRect(
            (x - -space.minX) * SCALING_FACTOR,
            (y - -space.minY) * SCALING_FACTOR,
            SCALING_FACTOR * STEP,
            SCALING_FACTOR * STEP
          );
          context.fill();
        }
      }
      context.fillStyle = "black";
      context.fillRect(0, (0 - -space.minY) * SCALING_FACTOR, 10000, 0.25);
      context.fillRect((0 - -space.minX) * SCALING_FACTOR, 0, 0.25, 10000);

      planets.forEach((planet) => {
        drawPlanet(context, planet, space);
      });
    }
  }, [planets, space]);

  return (
    <canvas
      ref={canvas}
      width={(space.minX - -space.maxX) * SCALING_FACTOR}
      height={(space.minY - -space.maxY) * SCALING_FACTOR}
      style={{ border: "solid" }}
    />
  );
};

const PlanetsQueryWrapper = ({
  currentBlock,
  currentSpace,
}: {
  currentBlock: number;
  currentSpace: any;
}) => {
  const [block, setBlock] = useState(currentBlock);

  const { loading, error, data } = useQuery(PLANETS, {
    variables: { block },
    fetchPolicy: "network-only",
  });

  if (loading) return <p>Loading..</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {data.space ? (
        <NearestNeighbourCanvas
          planets={data.planets.concat(data.planets2)}
          space={currentSpace}
        />
      ) : (
        <canvas
          width={(currentSpace.minX - -currentSpace.maxX) * SCALING_FACTOR}
          height={(currentSpace.minY - -currentSpace.maxY) * SCALING_FACTOR}
          style={{ border: "solid" }}
        />
      )}
      <div>
        <label htmlFor="customRange1" className="form-label">
          View at block:{" "}
          <a href={`https://blockscout.com/xdai/mainnet/block/${block}`}>
            {block}
          </a>
        </label>
        <input
          type="range"
          className="form-range"
          id="customRange1"
          min={FIRST_BLOCK}
          max={currentBlock}
          step={BLOCK_STEP}
          value={block}
          onChange={(e) => setBlock(parseInt(e.target.value))}
        ></input>
      </div>
    </div>
  );
};

const MapBlank = () => {
  const { loading, error, data } = useQuery(BLOCK);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <PlanetsQueryWrapper
        currentBlock={data._meta.block.number}
        currentSpace={data.space}
      />
    </div>
  );
};

const Territories = () => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h2>Faction Territories</h2>
      <MapBlank />
    </div>
  );
};

export default Territories;
