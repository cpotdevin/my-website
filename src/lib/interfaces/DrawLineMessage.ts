import type Point from './Point';

interface DrawLineMessage {
  from: Point;
  to: Point;
}

export default DrawLineMessage;
