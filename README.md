# ESC-W1-traffic-light

![image](https://github.com/user-attachments/assets/59849f39-9fe2-4b11-8119-a3a66598954c)

회로 연결 정보
LED 연결

빨간 LED: 11번 핀 → 저항(330Ω) → LED(+) → GND
노란 LED: 9번 핀 → 저항(330Ω) → LED(+) → GND
초록 LED: 10번 핀 → 저항(330Ω) → LED(+) → GND
버튼 연결 (내부 풀업 저항 사용)

버튼2 (긴급 모드): 한쪽 다리를 GND에, 대각선 다리를 2번 핀에 연결
버튼3 (모든 LED 깜빡임): 한쪽 다리를 GND에, 대각선 다리를 3번 핀에 연결
버튼4 (시스템 ON/OFF): 한쪽 다리를 GND에, 대각선 다리를 4번 핀에 연결
→ 버튼은 내부 풀업 저항 (INPUT_PULLUP) 설정을 사용하여 GND와 연결되면 LOW 신호를 받음

가변저항 연결 (A0 핀 사용)
**wokwi에서 가변저항을 못찾아서 스위치로 그림을 대체합니다.

가변저항의 가운데 핀 → A0 핀
한쪽 단자 → 5V
반대쪽 단자 → GND 

