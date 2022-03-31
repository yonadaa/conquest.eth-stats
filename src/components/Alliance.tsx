import React from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { useParams } from 'react-router-dom';
import MapSingle from './MapSingle';
import { formatOwner, formatTokens } from './Helpers';
import Blockies from 'react-blockies';
import { addressToColor } from './Map';

const ALLIANCE = gql`
  query GetAlliance($id: String) {
    alliance(id:$id) {
      id
      members {
        id
        owner {
          id
          currentStake
          tokenBalance
        }
      }
    }
  }
`;

const OwnersTable = ({ owners }: { owners: any[] }) => {
  return <table className='table table-primary'>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Address</th>
        <th>Current stake</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>
      {owners.map((owner: any, i) =>
        <tr key={owner.id}>
          <th>{i + 1}</th>
          <th>{formatOwner(owner)}</th>
          <th>{formatTokens(owner.currentStake)}</th>
          <th>{formatTokens(owner.tokenBalance)}</th>
        </tr>)
      }
    </tbody>
  </table>;
}

function Alliance() {
  let { id } = useParams();

  const { loading, error, data } = useQuery(ALLIANCE, {
    variables: { id },
  });

  if (loading) {
    return <p>
      <div>
        <h1>Alliance ...</h1>
        <h3>Members</h3>
      </div>
    </p>;
  }

  if (error) {
    return <p>Error :(</p>;
  }

  const alliance = data.alliance;

  return (
    <div>
      <h1>Alliance {id ? id.slice(0, 8) : "null"}...</h1>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        {id ? <MapSingle condition={(p) => p.owner && p.owner.alliances.length > 0 && p.owner.alliances.some((a: any) => a.alliance.id === id)} color={addressToColor(id)} /> : null}
        <div>
          <div style={{ border: 'solid', borderWidth: 1, borderColor: 'grey', justifyContent: 'center', alignContent: 'center' }}>
            <h3><b>{alliance.id.slice(0, 8)}...</b></h3>
            <Blockies scale={15} seed={alliance.id} className="border border-2 border-dark" />
            <h5>Overview</h5>
            <table className='table table-info'>
              <tbody>
                <tr>
                  <td><b>Member count</b></td>
                  <td>{alliance.members.length}</td>
                </tr>
                <tr>
                  <td><b>Admin page</b></td>
                  <td><a href={`https://basic-alliances-beta.conquest.etherplay.io/alliances/#${id}`}>Click here</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <h3>Members</h3>
      <OwnersTable owners={alliance.members.map((m: any) => m.owner)} />
    </div>
  );
}

export default Alliance;
