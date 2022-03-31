import React, { useState } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { formatOwner, formatPlanet, formatTimestamp, formatTokens } from './Helpers';

export const PLANETS_IMAGE_URL = "https://beta.conquest.etherplay.io/_app/assets/planets-cbf882b4.png";

const PLANETS = gql`
  query GetPlanets($orderBy: String) {
    planets(first:200, orderBy: $orderBy, orderDirection:desc) {
      id
      x
      y
      lastUpdated
      stakeDeposited
      owner {
        id
      }
    }
  }
`

const PlanetsTable = ({ planets }: { planets: any[] }) => {
  return <table className='table table-primary'>
    <thead>
      <tr>
        <th>Coordinates</th>
        <th>Last updated</th>
        <th>Stake deposited</th>
        <th>Owner</th>
      </tr>
    </thead>
    <tbody>
      {planets.map((p: any) =>
        <tr key={p.id}>
          <th>{formatPlanet(p)}</th>
          <th>{formatTimestamp(p.lastUpdated)}</th>
          <th>{formatTokens(p.stakeDeposited)}</th>
          <th>{formatOwner(p.owner)}</th>
        </tr>)
      }
    </tbody>
  </table>;
}

const PlanetsQueryWrapper = ({ orderBy }: { orderBy: string }) => {
  const { loading, error, data } = useQuery(PLANETS, { variables: { orderBy } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <p><i>Showing the first {data.planets.length} results.</i></p>
      <PlanetsTable planets={data.planets} />
    </div>
  );
}

function Planets() {
  const [orderBy, setOrderBy] = useState("lastUpdated");

  return (
    <div>
      <h1>Planets</h1>
      <img alt="planets" src={PLANETS_IMAGE_URL} />
      <div style={{ margin: 20 }}>
        <label>Order by:</label>
        <select
          value={orderBy}
          onChange={e => setOrderBy(e.currentTarget.value)}>
          <option value="lastUpdated">Last updated</option>
          <option value="stakeDeposited">Stake deposited</option>
        </select>
        <PlanetsQueryWrapper orderBy={orderBy} />
      </div>
    </div >
  );
}

export default Planets;
