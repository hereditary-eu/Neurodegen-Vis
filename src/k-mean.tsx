type Point = number[];

type ClusterResult = {
    centroids: Point[];
    assignments: number[];
};

/**
 * Calculates the Euclidean distance between two points.
 */
function euclideanDistance(point1: Point, point2: Point): number {
    return Math.sqrt(
        point1.reduce(
            (sum, val, index) => sum + Math.pow(val - point2[index], 2),
            0
        )
    );
}

/**
 * Initializes centroids using the k-means++ algorithm.
 */
function initializeCentroids(data: Point[], k: number): Point[] {
    const centroids: Point[] = [];

    // Randomly choose the first centroid
    centroids.push(data[Math.floor(Math.random() * data.length)]);

    // Choose the remaining centroids
    while (centroids.length < k) {
        const distances = data.map((point) => {
            // Compute the minimum distance from the point to any existing centroid
            return Math.min(
                ...centroids.map((centroid) =>
                    euclideanDistance(point, centroid)
                )
            );
        });

        // Compute the probability distribution based on squared distances
        const totalDistance = distances.reduce((sum, d) => sum + d ** 2, 0);
        const probabilities = distances.map((d) => d ** 2 / totalDistance);

        // Pick a new centroid based on the probability distribution
        let cumulativeProbability = 0;
        const randomValue = Math.random();
        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i];
            if (randomValue < cumulativeProbability) {
                centroids.push(data[i]);
                break;
            }
        }
    }

    return centroids;
}

/**
 * Assigns each point in the data to the nearest centroid.
 */
function assignClusters(data: Point[], centroids: Point[]): number[] {
    return data.map((point) => {
        let closestIndex = 0;
        let minDistance = euclideanDistance(point, centroids[0]);

        for (let i = 1; i < centroids.length; i++) {
            const distance = euclideanDistance(point, centroids[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        return closestIndex;
    });
}

/**
 * Updates centroids based on the mean of points assigned to each cluster.
 */
function updateCentroids(
    data: Point[],
    assignments: number[],
    k: number
): Point[] {
    const newCentroids = Array(k)
        .fill(null)
        .map(() => Array(data[0].length).fill(0));
    const counts = Array(k).fill(0);

    assignments.forEach((clusterIndex, i) => {
        const point = data[i];
        counts[clusterIndex]++;
        point.forEach((val, dim) => {
            newCentroids[clusterIndex][dim] += val;
        });
    });

    return newCentroids.map((centroid, index) => {
        if (counts[index] === 0) return centroid; // Avoid division by zero
        return centroid.map((val) => val / counts[index]);
    });
}

/**
 * Checks if centroids have stabilized (no significant change).
 */
function centroidsConverged(
    oldCentroids: Point[],
    newCentroids: Point[],
    tolerance = 1e-6
): boolean {
    return oldCentroids.every((oldCentroid, i) => {
        const distance = euclideanDistance(oldCentroid, newCentroids[i]);
        return distance < tolerance;
    });
}

/**
 * K-Means clustering algorithm.
 *
 * @param data - 2D array of points.
 * @param k - Number of clusters.
 * @returns An array of cluster assignments for each point.
 */
function kMeans(data: Point[], k: number, maxIterations = 100): number[] {
    if (data.length === 0 || k <= 0) {
        throw new Error("Data must not be empty and k must be greater than 0.");
    }

    let centroids = initializeCentroids(data, k);
    let assignments: number[] = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        const newAssignments = assignClusters(data, centroids);
        const newCentroids = updateCentroids(data, newAssignments, k);

        if (centroidsConverged(centroids, newCentroids)) {
            break;
        }

        centroids = newCentroids;
        assignments = newAssignments;
    }

    return assignments;
}

// Example usage:
const data: number[][] = [
    [1, 2],
    [1, 4],
    [1, 0],
    [10, 2],
    [10, 4],
    [10, 0],
    [7, 2],
    [7, 4],
    [7, 0],
    [4, 2],
];
const k = 4;
const result = kMeans(data, k);
console.log(result);
