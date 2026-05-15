import { Ride } from './Ride.js';

// Placeholder hierarchy — full build in M3.
export class FerrisWheel extends Ride {
  constructor(parent, pos) {
    super(null);
    this.root = null;
    // geometry built in M3
    void parent; void pos;
  }
  update(_dt, _elapsed) {}
}
