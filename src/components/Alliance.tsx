import React from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { useParams } from 'react-router-dom';
import MapAlliance from './MapAlliance';
import { formatOwner, formatTokens } from './Helpers';

const ALLIANCE = gql`
  query GetAlliance($id: String) {
    alliance(id:$id) {
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

  console.log(alliance)
  return (
    <div>
      <h1>Alliance {id ? id.slice(0, 8) : "null"}...</h1>
      <a href={`https://basic-alliances-beta.conquest.etherplay.io/alliances/#${id}`}>Admin page</a>
      {id ? <MapAlliance id={id} /> : null}
      <h3>Members</h3>
      <OwnersTable owners={alliance.members.map((m: any) => m.owner)} />
    </div>
  );
}

export default Alliance;
