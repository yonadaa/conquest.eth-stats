import {
  CURRENT_CLIENT,
  KNOWLEDGE_BASE,
  MEDIUM,
  SUBGRAPH_URL,
  VIDEO,
} from "./constants";

function UsefulLinks() {
  return (
    <div>
      <h1>Useful Links</h1>
      <ul>
        <li>
          <a href={KNOWLEDGE_BASE}>conquest.eth Knowledge Base</a>
        </li>
        <li>
          <a href={VIDEO}>"A game on L2" by Ronan Sandford</a>
        </li>
        <li>
          <a href={CURRENT_CLIENT}>Current game build</a>
        </li>
        <li>
          <a href={SUBGRAPH_URL}>Current Subgraph</a>
        </li>
        <li>
          <a href={MEDIUM}>Conquest.eth Medium</a>
        </li>
      </ul>
    </div>
  );
}

export default UsefulLinks;
