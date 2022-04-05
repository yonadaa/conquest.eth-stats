import React, { useEffect, useState } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { useParams } from 'react-router-dom';
import { formatAllianceOnlyBlockie, formatEvent, formatOwner, formatTimestamp } from './Helpers';
import * as ethers from 'ethers';
import { MapBlank } from './Map';
const planetsABI = require("./IOuterSpacePlanets.json");

const PLANET = gql`
  query GetPlanet($id: String) {
    planet(id:$id) {
      id
      x
      y
      active
      reward
      firstAcquired
      lastAcquired
      owner {
        id
        alliances{
          alliance{
            id
          }
        }
      }
      events(orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        __typename
      }
    }
  }
`;

function Planet() {
  const [state, setState] = useState<any>()
  let { id } = useParams();

  useEffect(() => {
    if ((window as any).ethereum) {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)

      const PlanetsContract = new ethers.Contract(
        "0x0766835123e3fFCe29744d83d8818B74bd676f15",
        planetsABI, provider
      );

      PlanetsContract.getPlanet(id).then((p: any) => setState(p));
    }
  }, [id])

  const { loading, error, data } = useQuery(PLANET, {
    variables: { id: id ? id.toLowerCase() : "" },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  if (!data.planet) return <p>This planet has not been claimed yet.</p>;

  const planet = data.planet;

  console.log(state)
  return (
    <div>
      <h1>Planet {planet.x}, {planet.y}</h1>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <MapBlank condition={(p) => p.id === planet.id ? 'red' : 'black'} />
        <div style={{ border: 'solid', borderWidth: 1, borderColor: 'grey' }}><div style={{ justifyContent: 'center', alignContent: 'center' }}>
          <h3><b>{planet.x}, {planet.y}</b></h3>
          <h5>Position</h5>
          <table className='table table-info text-start'>
            <tbody>
              {/* <tr>
                <td><b>Exact coordinates</b></td>
                {state ? <td>{Math.round(100 * parseInt(planet.x) + state.stats.subX / 3) / 100}, {Math.round(100 * (parseInt(planet.y) + state.stats.subY / 3)) / 100}</td> : "Install wallet!"}
              </tr> */}
              <tr>
                <td><b>Sector</b></td>
                <td>S({Math.floor((parseInt(planet.x) + 7) / 15)}, {Math.floor((parseInt(planet.y) + 7) / 15)})</td>
              </tr>
            </tbody>
          </table>
          <h5>Immutable statistics</h5>
          {state ?
            <table className='table table-info'>
              <tbody>
                <tr>
                  <td><b>Stake</b></td>
                  <td>{state.stats.stake}</td>
                </tr>
                <tr>
                  <td><b>Natives</b></td>
                  <td>{state.stats.natives}</td>
                </tr>
                <tr>
                  <td><b>Production</b></td>
                  <td>{state.stats.production}</td>
                </tr>
                <tr>
                  <td><b>Attack</b></td>
                  <td>{state.stats.attack}</td>
                </tr>
                <tr>
                  <td><b>Defense</b></td>
                  <td>{state.stats.defense}</td>
                </tr>
                <tr>
                  <td><b>Speed</b></td>
                  <td>{state.stats.speed}</td>
                </tr>
              </tbody>
            </table> : <div>You must have a wallet installed to see these attributes!</div>
          }
        </div>
          <div>
            <h5>Dynamic statistics</h5>
            <table style={{ width: 'fit-content' }} className='table table-info'>
              <tbody>
                <tr>
                  <td><b>Active</b></td>
                  <td>{planet.active ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td><b>Owner</b></td>
                  <td>{formatOwner(planet.owner)}</td>
                </tr>
                <tr>
                  <td><b>Alliances</b></td>
                  <td>{planet.owner.alliances.length > 0 ? planet.owner.alliances.map((a: any) => <span style={{ padding: 4 }}>{formatAllianceOnlyBlockie(a.alliance)}</span>) : "None"}</td>
                </tr>
                <tr>
                  <td><b>Reward</b></td>
                  <td>{planet.reward}</td>
                </tr>
                <tr>
                  <td><b>Last Acquired</b></td>
                  <td>{(new Date(planet.lastAcquired * 1000)).toDateString()}</td>
                </tr>
                <tr>
                  <td><b>First Acquired</b></td>
                  <td>{(new Date(planet.firstAcquired * 1000)).toDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <h3>Events</h3>
      <table className='table table-success'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {planet.events.map((e: any) =>
            <tr key={e.id}>
              <td>{formatEvent(e)}</td>
              <td>{formatTimestamp(parseInt(e.timestamp))}</td>
              <td>{e.__typename}</td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  );
}

export default Planet;
