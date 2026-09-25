/** Authored task patterns from the supplied bank. These describe requested outputs,
 * never expected answers, marks, tolerances or marking logic. */
const tasks: readonly [RegExp, readonly string[]][] = [
  [/Find its magnitude and the angle it makes/, ["Magnitude", "Angle"]],
  [/Find its speed and displacement after/, ["Speed", "Displacement"]],
  [
    /Find the stopping time and stopping distance/,
    ["Stopping time", "Stopping distance"],
  ],
  [
    /find the time to reach its greatest height and that height/,
    ["Time to greatest height", "Greatest height"],
  ],
  [
    /Find the time taken to hit the ground and its speed on impact/,
    ["Time to ground", "Impact speed"],
  ],
  [
    /Find (?:the magnitude of their acceleration|the acceleration) and the tension/,
    ["Acceleration", "Tension"],
  ],
  [
    /Find its acceleration down the plane and the normal reaction/,
    ["Acceleration", "Normal reaction"],
  ],
  [
    /Find its velocity and displacement from the initial point/,
    ["Velocity", "Displacement"],
  ],
  [/Find its velocity and acceleration at/, ["Velocity", "Acceleration"]],
  [
    /Find the vertical reactions at A and B/,
    ["Reaction at A", "Reaction at B"],
  ],
  [
    /Find the normal reaction, the friction force, and the acceleration/,
    ["Normal reaction", "Friction", "Acceleration"],
  ],
  [
    /Find its time of flight, horizontal range and greatest height/,
    ["Time of flight", "Horizontal range", "Greatest height"],
  ],
  [
    /Find its position relative to the launch point and its speed after/,
    ["Position relative to launch", "Speed"],
  ],
  [
    /Find the magnitude and direction of the resultant/,
    ["Resultant magnitude", "Resultant direction"],
  ],
  [
    /Find the resultant force in vector form and its magnitude/,
    ["Resultant vector", "Magnitude"],
  ],
  [
    /Calculate the new mean and median and state which measure is more affected/,
    ["New mean", "New median", "Effect of outlier"],
  ],
  [/find the mean and median/, ["Mean", "Median"]],
  [
    /Find \$Q_1\$, the median, \$Q_3\$ and the interquartile range/,
    ["Lower quartile", "Median", "Upper quartile", "Interquartile range"],
  ],
  [
    /find the lower and upper outlier boundaries/,
    ["Lower boundary", "Upper boundary"],
  ],
  [
    /calculate the mean, variance and standard deviation/,
    ["Mean", "Variance", "Standard deviation"],
  ],
  [/Find \$E\(Y\)\$ and \$Var\(Y\)\$/, ["Mean of Y", "Variance of Y"]],
  [
    /Find the mean and standard deviation of \$X\$/,
    ["Mean of X", "Standard deviation of X"],
  ],
  [/Find the range and IQR/, ["Range", "Interquartile range"]],
  [
    /State the cumulative-frequency levels used to estimate the median, lower quartile and upper quartile/,
    ["Median level", "Lower quartile level", "Upper quartile level"],
  ],
  [/Find \$k\$ and \$E\(X\)\$/, ["Value of k", "Expected value"]],
  [
    /Find \$y\$ when \$x=[^$]+\$ and interpret the factor/,
    ["Value of y", "Interpretation of factor"],
  ],
  [
    /Find the mean \$\\mu\$ and standard deviation \$\\sigma\$/,
    ["Mean", "Standard deviation"],
  ],
  [
    /state the mean and variance of the normal distribution/,
    ["Mean", "Variance"],
  ],
  [
    /find the model and predict t when n=\d+\. State one limitation/,
    ["Model", "Predicted time", "Model limitation"],
  ],
];
export function compoundParts(prompt: string): string[] | undefined {
  const match = tasks.find(([pattern]) => pattern.test(prompt));
  return match ? [...match[1]] : undefined;
}
