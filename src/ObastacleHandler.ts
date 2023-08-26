export default function getFilteredObstacles(obstacles: [number,number][], playerBounds: {left:number,right:number,top:number,bottom:number}, tileSize: number): [number,number][] {
    return obstacles.filter((obstacle) => {
        let obstacleBounds = {
            left: obstacle[0],
            right: (obstacle[0] + tileSize),
            top: obstacle[1],
            bottom: (obstacle[1] + tileSize)
        };
        // Check if the obstacle's bounding box overlaps with the player's extended bounding box.
        return !(obstacleBounds.left > playerBounds.right || 
          obstacleBounds.right < playerBounds.left || 
          obstacleBounds.top > playerBounds.bottom || 
          obstacleBounds.bottom < playerBounds.top);
        });
}
