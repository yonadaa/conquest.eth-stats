import React from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { useParams } from 'react-router-dom';
import { formatTimestamp, formatPlanet, formatOwner, formatEvent, eventToText } from './Helpers';
import { MapBlank } from './Map';

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
      <h1><b>F</b>{fleet.id.slice(0, 9)}</h1>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <MapBlank condition={(p) => (p.id === fleet.from.id) ? 'red' : 'black'} />
        <div style={{ border: 'solid', borderWidth: 1, borderColor: 'grey', justifyContent: 'center', alignContent: 'center' }}>
          <h3><b><b>F</b>{fleet.id.slice(0, 9)}</b></h3>
          <h5>Overview</h5>
          <table className='table table-info text-start'>
            <tbody>
              <tr>
                <td><b>Owner</b></td>
                <td>{formatOwner(fleet.owner)}</td>
              </tr>
              <tr>
                <td><b>Quantity</b></td>
                <td>{fleet.quantity}</td>
              </tr>
              <tr>
                <td><b>Launch Time</b></td>
                <td>{formatTimestamp(fleet.launchTime)}</td>
              </tr>
              <tr>
                <td><b>From</b></td>
                <td>{formatPlanet(fleet.from)}</td>
              </tr>
              <tr>
                <td><b>To</b></td>
                <td>{fleet.to ? formatPlanet(fleet.to) : "?"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
