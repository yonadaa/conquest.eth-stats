import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ZAxis, Legend, ResponsiveContainer } from 'recharts';
import { addressToColor } from './Map';

const PLANETS = gql`
  query  {
    space(id:"Space") {
      minX
      maxX
      minY
      maxY
    }
    planets(first: 1000) {
      id
      x
      y
      stakeDeposited
      reward
      owner {
        id
        alliances {
          alliance {
            id
          }
        }
      }
    }
  }
`

const Example = () => {
  const { loading, error, data } = useQuery(PLANETS);

  if (loading) return <p>Loading</p>;
  if (error) return <p>Error: {error}</p>;

  const planets = data.planets.map((p: any) => ({ ...p, z: p.stakeDeposited / (10 ** 18) }))

  let buckets: any = {}
  planets.forEach((p: any) => {
    if (!buckets[p.owner.id]) {
      buckets[p.owner.id] = [];
    }
    buckets[p.owner.id] = [...buckets[p.owner.id], p]
  })

  return (
    <div style={{ width: 600, height: 600, alignContent: 'center' }}>
      <ResponsiveContainer width="100%" height="100%" >
        <ScatterChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }} >
          <XAxis type="number" dataKey="x" domain={[-parseInt(data.space.minX), parseInt(data.space.maxX)]} name="x" tick={false} />
          <YAxis type="number" dataKey="y" domain={[-parseInt(data.space.minY), parseInt(data.space.maxY)]} name="y" tick={false} reversed />
          <ZAxis type="number" dataKey="z" range={[0, 72]} name="stakeDeposited" />
          {/* <Legend /> */}
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />

          {Object.values(buckets).map((ps: any) => <Scatter name={ps[0].owner.id.slice(0, 6)} data={ps} fill={addressToColor(ps[0].owner.id)} />)}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}


export default Example;