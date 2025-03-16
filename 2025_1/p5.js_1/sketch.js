
let port;
let connectBtn;
let redSlider, yellowSlider, greenSlider;
let redState = false;
let yellowState = false;
let greenState = false;
let currentMode = "Mode: Traffic Light"; // Initial mode
let potValue = 0; // 가변 저항 값 저장 변수
let canvasHeight = 700; // 캔버스 높이

function setup() {
  createCanvas(400, canvasHeight); // 캔버스를 더 길게 설정

  port = createSerial(); // web serial controll object

  // 이전 연결 정보를 통해 자동으로 연결
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], 9600); // 과거에 사용했던 포트에 9600 baud rate로 연결
  }

  // web serial connect button setting
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(50, 20);
  connectBtn.mousePressed(connectBtnClick);



  // 슬라이더 생성
  redSlider = createSlider(0, 10000, 2000); // 빨간불 슬라이더 (0초 ~ 10초, 기본값 2초)
  redSlider.position(50, 450);
  redSlider.style("width", "300px");
  redSlider.input(() => sendSliderValue("red", redSlider.value()));

  yellowSlider = createSlider(0, 10000, 500); // 노란불 슬라이더 (0초 ~ 10초, 기본값 0.5초)
  yellowSlider.position(50, 520);
  yellowSlider.style("width", "300px");
  yellowSlider.input(() => sendSliderValue("yellow", yellowSlider.value()));

  greenSlider = createSlider(0, 10000, 2000); // 초록불 슬라이더 (0초 ~ 10초, 기본값 2초)
  greenSlider.position(50, 590);
  greenSlider.style("width", "300px");
  greenSlider.input(() => sendSliderValue("green", greenSlider.value()));
}

function draw() {
  // 모드 텍스트 표시
  background(255); // 배경 초기화
  fill(0);
  textSize(24); // 큰 글씨
  textAlign(LEFT, CENTER);
  text(`${currentMode}`, 50, 70); // 연결 버튼 바로 아래에 표시

  // 슬라이더 이름 표시
  fill(0);
  textSize(14);
  textAlign(LEFT, CENTER);
  text("Red Light Duration (s)", 50, 440); // 빨간불 슬라이더 이름
  text("Yellow Light Duration (s)", 50, 510); // 노란불 슬라이더 이름
  text("Green Light Duration (s)", 50, 580); // 초록불 슬라이더 이름

  // 슬라이더 눈금 표시
  drawSliderTicks(redSlider, 0, 10, 50, 470); // 빨간불 슬라이더 눈금
  drawSliderTicks(yellowSlider, 0, 10, 50, 540); // 노란불 슬라이더 눈금
  drawSliderTicks(greenSlider, 0, 10, 50, 610); // 초록불 슬라이더 눈금

  let n = port.available(); // 수신된 데이터가 있으면
  if (n > 0) {
    let str = port.readUntil("\n"); // 개행문자까지 읽고
    let timestamp =
      nf(hour(), 2) + ":" + nf(minute(), 2) + ":" + nf(second(), 2); // 디버깅용 정보
    print(timestamp + "  " + nf(n, 2) + ":" + trim(str)); // 해당 정보를 콘솔에 보여줌 (디버깅용)

    // 가변 저항 값 추출
    if (str.startsWith("potValue:")) {
      let valueStr = str.split(":")[1]; // "potValue:900"에서 "900" 추출
      potValue = int(valueStr.trim()); // 문자열을 정수로 변환
      console.log("Potentiometer Value:", potValue); // 디버깅 메시지
    }

    // 시스템 OFF 처리
    if (str === "Mode: System Off\n") {
      currentMode = str.trim();

      redState = false;
      yellowState = false;
      greenState = false;

      // 디버깅 메시지
      console.log("System Off: All lights turned off");

      // 화면 즉시 업데이트
      fill("gray");
      circle(100, 180, 40); // 빨간불
      circle(100, 240, 40); // 노란불
      circle(100, 300, 40); // 초록불

      return; // 다른 작업이 실행되지 않도록 종료
    }

    // 빨간불
    if (str === "R\n") redState = true;
    else if (str === "RL\n" || str === "Mode: System Off\n") redState = false;

    // 노란불
    if (str === "Y\n" ) yellowState = true;
    else if (str === "YL\n" || str === "Mode: System Off\n") yellowState = false;

    // 초록불
    if (str === "G\n" ) greenState = true;
    else if (str === "GL\n" || str === "Mode: System Off\n") greenState = false;

    // Update and display mode if str contains "Mode"
    if (str.startsWith("Mode")) {
      currentMode = str.trim(); // Update the current mode
      updateTrafficLight();
      console.log("Current Mode:", currentMode); // 디버깅 메시지
    }
  }

  // 원형 게이지 표시
  fill(255); // 배경색으로 채움 (흰색)
  noStroke();
  ellipse(300, 200, 120, 120); // 원형 게이지 영역을 덮음

  // 게이지 값 계산
  let angle = map(potValue, 0, 1023, 0, TWO_PI); // 값을 각도로 변환

  // 원형 게이지 그리기
  noFill();
  stroke(200);
  strokeWeight(10);
  ellipse(300, 200, 100, 100); // 게이지 배경

  // 게이지 값 표시
  stroke(0, 255, 0);
  arc(300, 200, 100, 100, -HALF_PI, -HALF_PI + angle); // 게이지 값

  // 가변 저항 값 텍스트로 표시
  noStroke();
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(potValue, 300, 200); // 중앙에 값 표시

  // changes button label based on connection status
  if (!port.opened()) {
    connectBtn.html("Connect to Arduino");
  } else {
    connectBtn.html("Disconnect");
  }

  // 신호등 상태 업데이트
   updateTrafficLight();
}



function updateTrafficLight() {
  // 빨간불
  fill(redState ? "red" : "gray");
  circle(100, 180, 40);
  

  // 노란불
  fill(yellowState ? "yellow" : "gray");
  circle(100, 240, 40);

  // 초록불
  fill(greenState ? "green" : "gray");
  circle(100, 300, 40);
}

function connectBtnClick() {
  if (!port.opened()) {
    port.open(9600); // 9600 baudRate
  } else {
    port.close();
  }
}

function sendSliderValue(color, value) {
  let data = `${color}:${value}\n`; // "red:2000\n" 형식으로 데이터 전송
  port.write(data);
  console.log(`Sent ${data.trim()} to Arduino`);
}

// 슬라이더 눈금 그리기 함수
function drawSliderTicks(slider, min, max, x, y) {
  let sliderWidth = parseInt(slider.style("width")); // 슬라이더의 너비
  let tickCount = max - min + 1; // 눈금 개수 (1초 단위)
  let tickSpacing = sliderWidth / (tickCount - 1); // 눈금 간격

  stroke(0);
  strokeWeight(1);
  for (let i = 0; i < tickCount; i++) {
    let tickX = x + i * tickSpacing;
    line(tickX, y - 5, tickX, y + 5); // 눈금 선
    let tickValue = min + i; // 눈금 값 계산
    noStroke();
    fill(0);
    textSize(10);
    textAlign(CENTER, CENTER);
    text(tickValue, tickX, y + 15); // 눈금 값 표시
  }
}