import styles from "./Cube.module.css";
import { CSSProperties, useEffect, useState, useRef } from "react";
import range from "lodash/range";

const Cube = () => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [cubeSize, setCubeSize] = useState(300);
  const viewport = useRef<HTMLDivElement | null>(null);

  // config vars
  const puzzle = { gridSize: 3 };
  const fps = 20;
  const sensitivity = 0.1;
  const sensitivityFade = 0.93;
  const touchSensitivity = 1.5;
  const speed = 2;

  // cube vars
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const mouseX = useRef<number>(0);
  const mouseY = useRef<number>(0);
  const distanceX = useRef<number>(0);
  const distanceY = useRef<number>(0);
  const torqueX = useRef<number>(0);
  const torqueY = useRef<number>(0);
  const [positionY, setPositionY] = useState<number>(136);
  const [positionX, setPositionX] = useState<number>(1122);

  const down = useRef<boolean>(false);
  const upsideDown = useRef<boolean>(true);
  const [currentSide, setCurrentSide] = useState<number>(5);

  const calculateSideRotations = () => {
    const sides = [];
    if (positionY > 90 && positionY < 270) {
      sides[0] = positionX + torqueX.current + 180;
    } else {
      sides[0] = positionX - torqueX.current + 180;
    }
    sides[1] = sides[2] = sides[3] = sides[4] = upsideDown.current ? 0 : 180;
    if (positionY > 90 && positionY < 270) {
      sides[5] = -(positionX + torqueX.current);
    } else {
      sides[5] = -(positionX - torqueX.current);
    }
    return sides;
  };

  const [sideRotations, setSideRotations] = useState<number[]>(
    calculateSideRotations()
  );

  const selected = (face: number, row: number, col: number) => {
    console.log(face, row, col);
  };

  // onMount useEffect
  useEffect(() => {
    const animate = () => {
      distanceX.current = mouseX.current - lastX.current;
      distanceY.current = mouseY.current - lastY.current;
      lastX.current = mouseX.current;
      lastY.current = mouseY.current;

      let newPositionY = positionY;
      let newPositionX = positionX;

      let calculatedSide = 0;

      if (down.current) {
        torqueX.current =
          torqueX.current * sensitivityFade +
          (distanceX.current * speed - torqueX.current) * sensitivity;

        torqueY.current =
          torqueY.current * sensitivityFade +
          (distanceY.current * speed - torqueY.current) * sensitivity;
      }

      if (Math.abs(torqueX.current) > 1.0 || Math.abs(torqueY.current) > 1.0) {
        if (!down.current) {
          torqueX.current *= sensitivityFade;
          torqueY.current *= sensitivityFade;
        }

        newPositionY -= torqueY.current;

        if (newPositionY > 360) {
          newPositionY -= 360;
        } else if (newPositionY < 0) {
          newPositionY += 360;
        }

        if (newPositionY > 90 && newPositionY < 270) {
          newPositionX -= torqueX.current;
          if (!upsideDown.current) {
            upsideDown.current = true;
          }
        } else {
          newPositionX += torqueX.current;
          if (upsideDown.current) {
            upsideDown.current = false;
          }
        }

        if (newPositionX > 360) {
          newPositionX -= 360;
        } else if (newPositionX < 0) {
          newPositionX += 360;
        }

        if (
          !(newPositionY >= 46 && newPositionY <= 130) &&
          !(newPositionY >= 220 && newPositionY <= 308)
        ) {
          if (upsideDown.current) {
            if (newPositionX >= 42 && newPositionX <= 130) {
              calculatedSide = 2;
            } else if (newPositionX >= 131 && newPositionX <= 223) {
              calculatedSide = 1;
            } else if (newPositionX >= 224 && newPositionX <= 314) {
              calculatedSide = 4;
            } else {
              calculatedSide = 3;
            }
          } else {
            if (newPositionX >= 42 && newPositionX <= 130) {
              calculatedSide = 4;
            } else if (newPositionX >= 131 && newPositionX <= 223) {
              calculatedSide = 3;
            } else if (newPositionX >= 224 && newPositionX <= 314) {
              calculatedSide = 2;
            } else {
              calculatedSide = 1;
            }
          }
        } else {
          if (newPositionY >= 46 && newPositionY <= 130) {
            calculatedSide = 5;
          }
          if (newPositionY >= 220 && newPositionY <= 308) {
            calculatedSide = 0;
          }
        }
        if (calculatedSide !== currentSide) {
          setCurrentSide(calculatedSide);
        }
      }

      setPositionX(newPositionX);
      setPositionY(newPositionY);
    };

    const mouseDownEvent = () => {
      down.current = true;
    };

    const mouseUpEvent = () => {
      down.current = false;
    };

    const keyUpEvent = () => {
      down.current = false;
    };

    const mouseMoveEvent = (e: any) => {
      mouseX.current = e.pageX;
      mouseY.current = e.pageY;
    };

    const touchStartEvent = (e: any) => {
      down.current = true;

      if (e.touches) {
        e = e.touches[0];
      }

      mouseX.current = e.pageX / touchSensitivity;
      mouseY.current = e.pageY / touchSensitivity;
      lastX.current = mouseX.current;
      lastY.current = mouseY.current;
    };

    const touchMoveEvent = (e: any) => {
      if (e.preventDefault) {
        e.preventDefault();
      }

      if (!!e?.touches?.length) {
        e = e.touches[0];
        mouseX.current = e.pageX / touchSensitivity;
        mouseY.current = e.pageY / touchSensitivity;
      }
    };

    const touchEndEvent = () => {
      down.current = false;
    };

    const resizeEvent = () => {
      if (viewport.current) {
        setCubeSize(Math.round(viewport.current.clientWidth * 0.6));
      }

      setInitialized(true);
    };

    resizeEvent();

    window.addEventListener("resize", resizeEvent, false);

    if (viewport.current) {
      viewport.current.addEventListener("mousedown", mouseDownEvent, false);
      viewport.current.addEventListener("mouseup", mouseUpEvent, false);
      viewport.current.addEventListener("mousemove", mouseMoveEvent, false);
      viewport.current.addEventListener("keyup", keyUpEvent, false);
      viewport.current.addEventListener("touchstart", touchStartEvent, false);
      viewport.current.addEventListener("touchmove", touchMoveEvent, false);
      viewport.current.addEventListener("touchend", touchEndEvent, false);
    }

    setInterval(animate, fps);

    return () => {
      window.removeEventListener("resize", resizeEvent, false);

      if (viewport.current) {
        viewport.current.removeEventListener(
          "mousedown",
          mouseDownEvent,
          false
        );
        viewport.current.removeEventListener("mouseup", mouseUpEvent, false);
        viewport.current.removeEventListener(
          "mousemove",
          mouseMoveEvent,
          false
        );
        viewport.current.removeEventListener("keyup", keyUpEvent, false);
        viewport.current.removeEventListener(
          "touchstart",
          touchStartEvent,
          false
        );
        viewport.current.removeEventListener(
          "touchmove",
          touchMoveEvent,
          false
        );
        viewport.current.removeEventListener("touchend", touchEndEvent, false);
      }
    };
  }, []);

  return (
    <div className={styles.aspectContainer}>
      <div
        ref={viewport}
        className={styles.viewport}
        style={
          {
            "--grid-size": puzzle.gridSize,
            "--cube-size": `${cubeSize}px`,
            opacity: initialized ? 1 : 0,
          } as CSSProperties
        }
      >
        <div
          className={styles.cube}
          style={{
            transform: `rotateX(${positionY}deg) rotateY(${positionX}deg)`,
          }}
        >
          {range(6).map((n, face) => (
            <div key={`face-${face}`} className={`${styles.face} face-${face}`}>
              <div
                className={`${styles.cubeImage} ${
                  currentSide === face ? "active" : ""
                }`}
              >
                {range(puzzle.gridSize).map((n, row) => (
                  <div key={`face${face}-row-${row}`} className={styles.row}>
                    {range(puzzle.gridSize).map((n, col) => (
                      <div
                        key={`face${face}-row-${row}-${col}`}
                        className={styles.col}
                        onClick={() => selected(face, row, col)}
                      >
                        <span
                          style={{
                            transform: `rotate(${sideRotations[face]}deg)`,
                          }}
                        >
                          A
                        </span>
                      </div>
                    ))}

                    {range(puzzle.gridSize - 1).map((d) => (
                      <div
                        key={`row-divide-${d}`}
                        className={styles.rowDivider}
                        style={{ "--divider-num": d + 1 } as CSSProperties}
                      />
                    ))}

                    {range(puzzle.gridSize - 1).map((d) => (
                      <div
                        key={`col-divide-${d}`}
                        className={styles.colDivider}
                        style={{ "--divider-num": d + 1 } as CSSProperties}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cube;
