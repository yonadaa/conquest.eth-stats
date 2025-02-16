import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  formatAllianceOnlyBlockie,
  formatOwner,
  formatTokens,
} from "./Helpers";

const OWNERS = gql`
  query GetOwners($orderBy: String) {
    owners(first: 1000, orderBy: $orderBy, orderDirection: desc) {
      id
      currentStake
      playTokenBalance
      alliances {
        alliance {
          id
        }
      }
    }
  }
`;

export const OwnersTable = ({ owners }: { owners: any[] }) => {
  const sum = owners.reduce(
    (partialSum, a) => partialSum + Number(a.currentStake) / 10 ** 18,
    0
  );
  console.log(sum);

  return (
    <table className="table table-primary">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Address</th>
          <th>Current stake</th>
          <th>Balance</th>
          <th>Alliances</th>
        </tr>
      </thead>
      <tbody>
        {owners.map((owner: any, i) => (
          <tr key={owner.id}>
            <th>{i + 1}</th>
            <th>{formatOwner(owner)}</th>
            <th>{formatTokens(owner.currentStake)}</th>
            <th>{formatTokens(owner.playTokenBalance)}</th>
            <td>
              {owner.alliances.length > 0
                ? owner.alliances.map((a: any) => (
                    <span style={{ padding: 4 }}>
                      {formatAllianceOnlyBlockie(a.alliance)}
                    </span>
                  ))
                : "None"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const OwnersQueryWrapper = ({ orderBy }: { orderBy: string }) => {
  const { loading, error, data } = useQuery(OWNERS, {
    variables: { orderBy: orderBy },
  });

  console.log(error);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
      <p>
        <i>{data.owners.length} results.</i>
      </p>
      <OwnersTable owners={data.owners} />
    </div>
  );
};

function Owners() {
  const [orderBy, setOrderBy] = useState("currentStake");

  return (
    <div>
      <h1>Owners</h1>
      <label>Order by:</label>
      <select
        value={orderBy}
        onChange={(e) => setOrderBy(e.currentTarget.value)}
      >
        <option value="currentStake">Current stake</option>
        <option value="tokenBalance">Balance</option>
      </select>
      <OwnersQueryWrapper orderBy={orderBy} />
    </div>
  );
}

export default Owners;
