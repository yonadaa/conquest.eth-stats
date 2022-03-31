import React from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { useParams } from 'react-router-dom';
import { formatTimestamp, formatPlanet, formatOwner, formatEvent, eventToText } from './Helpers';

const FLEET = gql`
  query GetFleet($id: String) {
    fleet(id:$id) {
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
      events(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        __typename
        ... on PlanetStakeEvent {
          stake
          planet {
            id
            x
            y
          }
          owner {
            id
          }
        }
        ... on FleetSentEvent {
          quantity
          fleet {
            id
          }
          planet {
            id
            x
            y
          }
          owner {
            id
          }
        }
        ... on FleetArrivedEvent {
          quantity
          won
          gift
          fleet {
            id
          }
          owner {
            id
          }
          destinationOwner {
            id
          }
          planet {
            id
            x
            y
          }
          from {
            id
            x
            y
          }
        }
      }
    }
  }
`;

function Fleet() {
  let { id } = useParams();

  const { loading, error, data } = useQuery(FLEET, {
    variables: { id: id },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const fleet = data.fleet;

  return (
    <div>
      <h1>Fleet overview</h1>
      <p>ID: {fleet.id}</p>
      <p>Launch time: {formatTimestamp(fleet.launchTime)} | owner: {formatOwner(fleet.owner)} | from: {formatPlanet(fleet.from)} | to: {fleet.to ? formatPlanet(fleet.to) : "?"}</p>
      <h3>Events</h3>
      <table className='table table-success'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {fleet.events.map((p: any) =>
            <tr key={p.id}>
              <td>{formatEvent(p)}</td>
              <td>{formatTimestamp(parseInt(p.timestamp))}</td>
              <td>{eventToText(p)}</td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  );
}

export default Fleet;
