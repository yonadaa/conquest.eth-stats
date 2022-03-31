import React from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { formatAlliance } from './Helpers';

const ALLIANCES = gql`
  query GetAlliances {
    alliances {
      id
    }
  }
`

const AlliancesTable = ({ alliances }: { alliances: any[] }) => {
  return <table className='table'>
    <thead>
      <tr>
        <th>ID</th>
      </tr>
    </thead>
    <tbody>
      {alliances.map((p: any) =>
        <tr key={p.id}>
          <th>{formatAlliance(p)}</th>
        </tr>)
      }
    </tbody>
  </table>;
}

const AlliancesQueryWrapper = () => {
  const { loading, error, data } = useQuery(ALLIANCES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      <p><i>{data.alliances.length} results.</i></p>
      <AlliancesTable alliances={data.alliances} />
    </div>
  );
}


function Alliances() {
  return (
    <div>
      <h1>Alliances</h1>
      <AlliancesQueryWrapper />
    </div>
  );
}

export default Alliances;
