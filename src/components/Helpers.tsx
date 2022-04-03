import React from 'react';
import { Link } from 'react-router-dom';
import Blockies from 'react-blockies';

export const formatTokens = (value: number) => <span>{value / (10 ** 18)}<img width="20" src="/play.svg" /></span>;
export const formatTimestamp = (timestamp: number) => new Date(timestamp * 1000).toUTCString();

export const formatOwner = (owner: any) => <Link to={`/owners/${owner.id}`}><Blockies seed={owner.id} />{owner.id.slice(0, 4)}...{owner.id.slice(-4)}</Link>;
export const formatFleet = (f: any) => <Link to={`/fleet/${f.id}`}><b>F</b>{f.id.slice(0, 9)}</Link>;
export const formatEvent = (f: any) => <span><b>E</b>{f.id}</span>;
export const formatAlliance = (a: any) => <Link to={`/alliance/${a.id}`}><Blockies seed={a.id} />{a.id}</Link>;
export const formatAllianceOnlyBlockie = (a: any) => <Link to={`/alliance/${a.id}`}><Blockies seed={a.id} /></Link>;
export const formatPlanet = (p: any) => <Link to={`/planet/${p.id}`}>{p.x},{p.y}</Link>;

export const eventToText = (e: any) => {
    if (e.__typename === 'PlanetStakeEvent') {
        return <div><span>{formatOwner(e.owner)} staked {formatTokens(parseInt(e.stake))} on {formatPlanet(e.planet)}.</span></div>
    } else if (e.__typename === 'PlanetExitEvent') {
        return <div><span>{formatOwner(e.owner)} tried to exit {formatPlanet(e.planet)} for a stake of {formatTokens(parseInt(e.stake))}.</span></div>
    } else if (e.__typename === 'ExitCompleteEvent') {
        return <div><span>{formatOwner(e.owner)} successfully exited {formatPlanet(e.planet)} with their stake of {formatTokens(parseInt(e.stake))}.</span></div>
    } else if (e.__typename === 'FleetSentEvent') {
        return <div><span>{formatOwner(e.owner)} sent fleet {formatFleet(e.fleet)}, consisting of {e.quantity} ships, from {formatPlanet(e.planet)}.</span></div>
    } else if (e.__typename === 'FleetArrivedEvent') {
        return <div><span>Fleet {formatFleet(e.fleet)}, sent by {formatOwner(e.owner)} and consisting of {e.quantity} ships, arrived at {formatPlanet(e.planet)}, owned by {formatOwner(e.destinationOwner)} from {formatPlanet(e.from)}. The attacker {e.won ? "won" : "lost"} the battle. The fleet was {e.gift ? "a gift" : "not a gift"}.</span></div>
    }

    return `Some event.`;
}
