![sool-tok](/readmeAssets/logo.jpg)

## Table of Contents

- [Introduction](#Introduction)
- [Features](#Features)
- [Usage](#Usage)
- [Stack](#Stack)
- [Deploy](#Deploy)
- [Project Process](#Project-Process)
- [Challenges](#Challenges)
- [Things to Do](#Things-to-Do)

## Introduction

술톡은 친구들과 함께 화상통화를 하며 게임을 즐길 수 있는 멀티 스트리밍 웹 애플리케이션 입니다.

#### 시연 영상

[![구동 영상](/readmeAssets/sool-tok-gif.gif)](https://youtu.be/FXCxWlxejZ0)

[유튜브 링크](https://www.sool-tok.live)

#### 배포 사이트

[배포 링크](https://www.sool-tok.live)

#### Repository

- [Frontend](https://github.com/sool-tok/sool-tok-frontend)
- [Backend](https://github.com/sool-tok/sool-tok-backend)

#### 프로젝트 기간

2020년 11월 9일 ~ 11월 27일

- 기획, 구조 설계 (1주)
- 개발 진행 (2주)

#### 프로젝트 멤버

김도희, 나소인, 신현창

#### 개발 목적

비즈니스 목적으로 주로 활용되고 있는 화상 통화 기능을 재밌게 사용할 수 있는 방법이 없을까?라는 아이디어에서 시작했습니다. 직접 만나지 않고도, 집에서 편하게 한잔하면서 친구와 화상 통화로 이야기하며 간단한 게임으로 흥을 돋우는 서비스 입니다.

## Features

- JSON Web Token 을 이용한 사용자 인증
- WebRTC & Peer, Socket을 이용한 다자간 실시간 화상 및 음성 통화 기능
- Speech Recognition API와 Socket을 이용한 음성 인식 미니게임
- MongoDB Atlas를 이용한 사용자 정보 및 친구 목록 관리
- 실시간 텍스트 Chat 기능
- Canvas를 활용한 동적인 애니메이션 효과

## Usage

#### Requirements

- 최신 버전의 크롬 브라우저 사용을 권장합니다.
- 마이크 / 카메라 접근 권한이 필요합니다.

#### Installation

Local 환경에서 실행하기 위한 사전 준비가 필요합니다.

- [Firebase API key](https://firebase.google.com/?hl=ko)
- [MongoDB](https://www.mongodb.com/)
- [Open SSL](https://www.ibm.com/support/knowledgecenter/SSMNED_5.0.0/com.ibm.apic.cmc.doc/task_apionprem_gernerate_self_signed_openSSL.html)

#### Frontend

Root 디렉토리에 `.env` 파일을 생성하고, 사전에 준비한 Firebase API Key를 입력합니다.

```

REACT_APP_FIREBASE_API_KEY=<YOUR Firebase API Key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<Your Firebase Auth Domain>
REACT_APP_FIREBASE_PROJECT_ID=<Your Firebase Project ID>
REACT_APP_FIREBASE_APP_ID=<Your Firebase APP ID>

```

```

git clone https://github.com/sool-tok/sool-tok-frontend
cd sool-tok
npm install
npm start

```

#### Backend

Root 디렉토리에 `.env` 파일을 생성하고, 사전에 준비한 MongoDB Url과 JWT의 Secret Key를 입력합니다.

```

MONGODB_URL=<Your MongoDB URL>
TOKEN_SECRET_KEY=<Your JWT Signature Secret KEY>

```

```

git clone https://github.com/sool-tok/sool-tok-backend
cd sool-tok
npm install
npm start

```


## Stack

#### Frontend

- JavaScript ES2015+
- React
- Redux
- Redux-saga
- WebRTC
- Socket.io
- Speech Recognition API
- Styled-components
- Jest for unit-test
- Enzyme for component-test
- ESLint

#### Backend

- JavaScript ES2015+
- Node.js
- Express
- MongoDB & Mongoose
- Json Web Token Authentication
- Socket.io
- Chai / Mocha / Supertest for unit-test
- ESLint

## Deploy

#### Frontend

- Netlify를 사용하여 애플리케이션 배포 및 관리

#### Backend

- AWS Elastic Beanstalk를 사용하여 애플리케이션 배포 및 관리
- Amazon ACM (AWS Certificate Manager)을 사용하여 SSL 관리
- https-client와 http-server 간의 연결을 위해 load-balancer 사용
- 파이프라인 연결 후 배포 자동화 구현

## Project Process

- 기술 스택 검토
- figma를 이용한 목업 설계
- 데이터베이스 스키마 설계
- Notion을 이용한 태스크 매니지먼트
- Git Repo를 구분하여 Client와 Server를 독립적으로 관리
- Git flow를 이용한 기능별 브랜치 관리

## Challenges

#### WebRTC 다중 피어 연결

#### React와 소켓 연결

#### Speech Recognition과 게임 알고리즘

#### Git 관리

#### 비동기 처리와 Redux-Saga

## Things to do
