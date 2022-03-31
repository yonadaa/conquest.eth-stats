import React, { useState } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { formatFleet, formatOwner, formatPlanet, formatTimestamp } from './Helpers';

const FLEETS = gql`
  query GetFleets($orderBy: String) {
    fleets(orderBy: $orderBy, orderDirection:desc) {
      id
      launchTime
      quantity
      from {
        id
        x
        y
      }
      to {
        id
        x
        y
      }
      owner {
        id
      }
    }
  }
`

const FLEETS_RESOLVED = gql`
  query GetFleets($orderBy: String, $resolved:Boolean) {
    fleets(orderBy: $orderBy, orderDirection:desc, where: {resolved:$resolved}) {
      id
      launchTime
      quantity
      from {
        id
        x
        y
      }
      to {
        id
        x
        y
      }
      owner {
        id
      }
    }
  }
`

const FleetsTable = ({ fleets }: { fleets: any[] }) => {
  return <table className='table'>
    <thead>
      <tr>
        <th>ID</th>
        <th>Launch time</th>
        <th>Quantity</th>
        <th>From</th>
        <th>To</th>
        <th>Owner</th>
      </tr>
    </thead>
    <tbody>
      {fleets.map((p: any) =>
        <tr key={p.id}>
          <th>{formatFleet(p)}</th>
          <th>{formatTimestamp(p.launchTime)}</th>
          <th>{p.quantity}</th>
          <th>{formatPlanet(p.from)}</th>
          <th>{p.to ? formatPlanet(p.to) : "?"}</th>
          <th>{formatOwner(p.owner)}</th>
        </tr>)
      }
    </tbody>
  </table>;
}

const FleetsQueryWrapperAll = ({ orderBy }: { orderBy: string }) => {
  const { loading, error, data } = useQuery(FLEETS, { variables: { orderBy } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <p><i>{data.fleets.length} results.</i></p>
      <FleetsTable fleets={data.fleets} />
    </div>
  );
}

const FleetsQueryWrapper = ({ orderBy, resolved }: { orderBy: string, resolved: boolean }) => {
  const { loading, error, data } = useQuery(FLEETS_RESOLVED, { variables: { orderBy, resolved } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <p><i>{data.fleets.length} results.</i></p>
      <FleetsTable fleets={data.fleets} />
    </div>
  );
}

function Planets() {
  const [resolved, setResolved] = useState("all");
  const [orderBy, setOrderBy] = useState("launchTime");

  return (
    <div>
      <h1>Fleets</h1>
      <label>Filter by:</label>
      <select
        value={resolved}
        onChange={e => setResolved(e.currentTarget.value)}>
        <option value="all">All</option>
        <option value="resolved">Resolved</option>
        <option value="unresolved">Unresolved</option>
      </select>
      <label>Order by:</label>
      <select
        value={orderBy}
        onChange={e => setOrderBy(e.currentTarget.value)}>
        <option value="launchTime">Launch time</option>
        <option value="quantity">Quantity</option>
      </select>
      {resolved === "all" ? <FleetsQueryWrapperAll orderBy={orderBy} /> : <FleetsQueryWrapper orderBy={orderBy} resolved={resolved === "resolved"} />}
    </div>
  );
}

export default Planets;
