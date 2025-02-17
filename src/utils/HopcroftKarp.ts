export class HopcroftKarp {
  setA: string[];
  setB: string[];
  exclusion: Record<string, string[]>;

  constructor(setA: string[], setB: string[], exclusion: Record<string, string[]>) {
    this.setA = setA;
    this.setB = setB;
    this.exclusion = exclusion;
  }

  // Utility function: Given a vertex u in setA, return an array of allowed neighbors from setB.
  getAllowedNeighbors(u: string) {
    // Convert the exclusion list for u to a Set for fast lookup (if it's not already a Set)
    const excludedSet = new Set(this.exclusion[u] || []);
    // Return those vertices in setB that are not excluded for u.
    return this.setB.filter((v) => !excludedSet.has(v));
  }

  // Hopcroft–Karp algorithm using an exclusion-based graph representation.
  findMaximumMatches() {
    // matchA[u] will store the partner in setB for vertex u (or null if unmatched)
    // matchB[v] will store the partner in setA for vertex v (or null if unmatched)
    const matchA: Record<string, string | null> = {};
    const matchB: Record<string, string | null> = {};

    // Initialize matches for all vertices in setA and setB.
    for (const u of this.setA) matchA[u] = null;
    for (const v of this.setB) matchB[v] = null;

    // dist will hold the BFS layers (distance from free vertices in setA)
    const dist: Record<string, number> = {};

    // BFS Phase: Build layers (distances) from free vertices in setA.
    const bfs = () => {
      const queue = [];
      for (const u of this.setA) {
        if (matchA[u] === null) {
          dist[u] = 0;
          queue.push(u);
        } else {
          dist[u] = Infinity;
        }
      }

      let reachedFreeB = false;

      while (queue.length > 0) {
        const u: string = queue.shift();
        // Only process if we're still within a finite layer.
        if (dist[u] < Infinity) {
          // Instead of graph[u], get allowed neighbors on the fly.
          const neighbors = this.getAllowedNeighbors(u);
          for (const v of neighbors) {
            // Get the matching partner for v.
            const partner = matchB[v];
            if (partner === null) {
              // We reached a free vertex in setB.
              reachedFreeB = true;
            } else if (dist[partner] === Infinity) {
              // Set the layer for partner and add it to the queue.
              dist[partner] = dist[u] + 1;
              queue.push(partner);
            }
          }
        }
      }
      return reachedFreeB;
    };

    // DFS Phase: Look for augmenting paths starting from vertex u in setA.
    const dfs = (u: string) => {
      if (u !== null) {
        const neighbors = this.getAllowedNeighbors(u);
        for (const v of neighbors) {
          const partner = matchB[v];
          if (partner === null || (dist[partner] === dist[u] + 1 && dfs(partner))) {
            // Found an augmenting path: update the matching.
            matchA[u] = v;
            matchB[v] = u;
            return true;
          }
        }
        // Mark this vertex as dead end for the current BFS layer.
        dist[u] = Infinity;
        return false;
      }
      return true;
    };

    let matchingSize = 0;
    // As long as BFS finds a free vertex in setB reachable from some free vertex in setA:
    while (bfs()) {
      for (const u of this.setA) {
        if (matchA[u] === null && dfs(u)) {
          matchingSize++;
        }
      }
    }
    return { match: matchA, matchingSize };
  }
}
