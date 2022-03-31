import React from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { useParams } from 'react-router-dom';
import { formatAlliance, formatEvent, formatFleet, formatPlanet, formatTimestamp, formatTokens } from './Helpers';
import { Container, Row, Col } from 'react-bootstrap';
import MapOwner from './MapOwner';

const OWNER = gql`
  query GetOwner($id: String) {
    owner(id:$id) {
      id
      currentStake
      tokenBalance
      planets(orderBy:lastUpdated orderDirection:desc) {
        id
        x
        y
        lastUpdated
        stakeDeposited
      }
      fleets(orderBy: launchTime, orderDirection: desc, where: {resolved: false}) {
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
      }
      alliances {
        alliance {
          id
        }
      }
      events(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
      }
    }
  }
`;

function Owner() {
  let { address } = useParams();

  const { loading, error, data } = useQuery(OWNER, {
    variables: { id: address ? address.toLowerCase() : "" },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const owner = data.owner;

  return (
    <div>
      <h1>Owner {owner.id.slice(0, 8)}...</h1>
      <p>current stake: {formatTokens(parseInt(owner.currentStake))} | balance: {formatTokens(parseInt(owner.tokenBalance))} | planets owned: {owner.planets.length} | unresolved fleets: {owner.fleets.length}</p>
      <a href={` https://account-service-beta.rim.workers.dev/get/${data.owner.id}`}>Contact details</a>
      <MapOwner id={owner.id} />
      <Container>
        <Row>
          <Col>
            <h3>Planets</h3>
            <p><i>{owner.planets.length} results.</i></p>
            <table className='table table-primary'>
              <thead>
                <tr>
                  <th>Coordinates</th>
                  <th>Last updated</th>
                  <th>Stake deposited</th>
                </tr>
              </thead>
              <tbody>
                {owner.planets.map((p: any) =>
                  <tr key={p.id}>
                    <td>{formatPlanet(p)}</td>
                    <th>{formatTimestamp(p.lastUpdated)}</th>
                    <td>{formatTokens(parseInt(p.stakeDeposited))}</td>
                  </tr>)
                }
              </tbody>
            </table>
          </Col>
          <Col>
            <h3>Unresolved Fleets</h3>
            <p><i>{owner.fleets.length} results.</i></p>
            <table className='table table-info'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sent at</th>
                  <th>Quantity</th>
                  <th>From</th>
                </tr>
              </thead>
              <tbody>
                {owner.fleets.map((f: any) =>
                  <tr key={f.id}>
                    <td>{formatFleet(f)}</td>
                    <td>{formatTimestamp(f.launchTime)}</td>
                    <td>{f.quantity}</td>
                    <td>{formatPlanet(f.from)}</td>
                  </tr>)
                }
              </tbody>
            </table>
          </Col>
          <Col>
            <h3>Alliances</h3>
            <p><i>{owner.alliances.length} results.</i></p>
            <table className='table table-secondary'>
              <thead>
                <tr>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {owner.alliances.length > 0 ? owner.alliances.map((a: any) =>
                  <tr key={a.alliance.id}>
                    <td>{formatAlliance(a.alliance)}</td>
                  </tr>
                ) : "This owner is not a member of any alliances!"}
              </tbody>
            </table>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Events</h3>
            <p><i>{owner.events.length} results.</i></p>
            <table className='table table-success'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {owner.events.map((e: any) =>
                  <tr key={e.id}>
                    <td>{formatEvent(e)}</td>
                    <td>{formatTimestamp(parseInt(e.timestamp))}</td>
                    <td>{e.__typename}</td>
                  </tr>)
                }
              </tbody>
            </table>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Owner;
