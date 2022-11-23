export class ImageIdInClusterMap {
  /** The outer map is a map of image names. The inner map is a map of hashes
   * associated with that image, and their associated image ids
   */
  protected map: Map<string, Map<string, number>> = new Map<string, Map<string, number>>();

  /** Associate a image/hash combo with a pod id */
  setIdRunning(imageName: string, hash: string, imageId) {
    const imageMap: Map<string, number> = this.map.get(imageName);
    if (!!imageMap) {
      // We already have an entry for this image, add the has/id combo to it
      imageMap.set(hash, imageId);
    } else {
      // This is the first time we've seen this image name, create a map for it and add the hash-image combo to it
      const newImageMap = new Map<string, number>()
      newImageMap.set(hash, imageId);
      this.map.set(imageName, newImageMap);
    }
  }

  /** Gets all IDS associated with all image names & hashes that have been added */
  getAllIds(): number[] {
    const ids = [];
    this.map.forEach(imageMap => {
      // Gets all values from the map and puts them into the id array
      ids.push(...Array.from(imageMap.values()));
    });
    return ids;
  }

  /** Check if a specific image/hash combo has an associated id. Returns undefined if none found*/
  getIdForImage(imageName: string, hash: string): number {
    const imageMap: Map<string, number> = this.map.get(imageName);
    if (!!imageMap) {
      return imageMap.get(hash);
    } else {
      return undefined;
    }
  }
}
