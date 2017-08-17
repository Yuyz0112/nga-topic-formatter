import React, { Component } from 'react';

const ANGLE = Math.PI / 6;
const SIN = Math.sin(ANGLE);
const COS = Math.cos(ANGLE);
const LENGTH = 100;
const LABEL = {
  width: 13 * 6,
  height: 13,
}
const vertexs = [
  [LENGTH * COS, 0],
  [2 * LENGTH * COS, LENGTH * SIN],
  [2 * LENGTH * COS, LENGTH + LENGTH * SIN],
  [LENGTH * COS, LENGTH + 2 * LENGTH * SIN],
  [0, LENGTH + LENGTH * SIN],
  [0, LENGTH * SIN],
];

function parse(str, totalLength) {
  const matches = str.match(/\[chartradar.*?(#.+)(|\s).*?\](.*?)\[\/chartradar]/);
  if (!matches || !matches[1] || !matches[3]) {
    return;
  }
  const color = matches[1];
  const data = matches[3].split(/\s+/);
  const max = parseInt(data.shift(), 10);
  const points = [];
  for (let i = 0; i < data.length; i += 2) {
    if (data[i] !== '') {
      const value = parseInt(data[i], 10);
      points.push({
        name: `${data[i + 1]}：${value}`,
        value,
        length: totalLength * value / max,
      });
    }
  }
  return {
    color,
    points,
  };
}

class Polygon extends Component {
  componentDidMount() {
    if (this.props.code) {
      this.draw();
    }
  }

  draw() {
    const { color, points } = parse(this.props.code, LENGTH) || {};
    if (!points) {
      return;
    }

    this.canvas.width = 2 * LENGTH * COS + 2 * LABEL.width;
    this.canvas.height = LENGTH + 2 * LENGTH * SIN + 3 * LABEL.height;
    const canvas = this.canvas.getContext('2d');
    canvas.fillStyle = '#e2eff1';
    canvas.beginPath();
    canvas.moveTo(vertexs[0][0] + LABEL.width, vertexs[0][1] + LABEL.height);
    canvas.lineTo(vertexs[1][0] + LABEL.width, vertexs[1][1] + LABEL.height);
    canvas.lineTo(vertexs[2][0] + LABEL.width, vertexs[2][1] + LABEL.height);
    canvas.lineTo(vertexs[3][0] + LABEL.width, vertexs[3][1] + LABEL.height);
    canvas.lineTo(vertexs[4][0] + LABEL.width, vertexs[4][1] + LABEL.height);
    canvas.lineTo(vertexs[5][0] + LABEL.width, vertexs[5][1] + LABEL.height);
    canvas.closePath();
    canvas.fill();
    canvas.fillStyle = 'black';
    canvas.fillText(points[0].name, vertexs[0][0] + LABEL.width / 2, vertexs[0][1] + LABEL.height);
    canvas.fillText(points[1].name, vertexs[1][0] + LABEL.width, vertexs[1][1] + LABEL.height);
    canvas.fillText(points[2].name, vertexs[2][0] + LABEL.width, vertexs[2][1] + LABEL.height);
    canvas.fillText(points[3].name, vertexs[3][0] + LABEL.width / 2, vertexs[3][1] + 2 * LABEL.height);
    canvas.fillText(points[4].name, vertexs[4][0], vertexs[4][1] + LABEL.height);
    canvas.fillText(points[5].name, vertexs[5][0], vertexs[5][1] + LABEL.height);

    canvas.fillStyle = color;
    canvas.beginPath();
    canvas.moveTo(LENGTH * COS + LABEL.width, LENGTH - points[0].length + LABEL.height);
    canvas.lineTo(LENGTH * COS + points[1].length * COS + LABEL.width, LENGTH - points[1].length * SIN + LABEL.height);
    canvas.lineTo(LENGTH * COS + points[2].length * COS + LABEL.width, LENGTH + points[1].length * SIN + LABEL.height);
    canvas.lineTo(LENGTH * COS + LABEL.width, LENGTH + points[3].length + LABEL.height);
    canvas.lineTo(LENGTH * COS - points[4].length * COS + LABEL.width, LENGTH + points[4].length * SIN + LABEL.height);
    canvas.lineTo(LENGTH * COS - points[5].length * COS + LABEL.width, LENGTH - points[5].length * SIN + LABEL.height);
    canvas.closePath();
    canvas.fill();
  }

  render() {
    return <canvas ref={ref => this.canvas = ref} />
  }
}

export default Polygon;
