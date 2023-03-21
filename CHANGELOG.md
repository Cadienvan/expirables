#### 1.6.1 (2023-03-21)

##### New Features

*  release action ([#19](https://github.com/Cadienvan/expirables/pull/19)) ([019edc36](https://github.com/Cadienvan/expirables/commit/019edc36e35703ba25fa12453b196f2e4feda4b0))

##### Refactors

* **tests:**  replace jest with tap ([#20](https://github.com/Cadienvan/expirables/pull/20)) ([719beda7](https://github.com/Cadienvan/expirables/commit/719beda7406fe9bc4aa7c6e569c23a108512a20d))

### 1.6.0 (2023-03-14)

##### Chores

* **LinkedList:**  linting docs ([d113d2a0](https://github.com/Cadienvan/expirables/commit/d113d2a08448761e9e3845b679427d27fcf5b654))

##### Documentation Changes

* **LinkedList:**  improved docs adding missing API ([6270c255](https://github.com/Cadienvan/expirables/commit/6270c2550b93edce5378f69f276b22a6b9e0e3d2))

##### New Features

*  moved setExpiration checks away from timeouts to improve perfs + added some checks on time ([8391836e](https://github.com/Cadienvan/expirables/commit/8391836e1e2285d1835da4098fd4b03dbdcec854))
*  added hooks to LinkedList + test + docs + get method ([#15](https://github.com/Cadienvan/expirables/pull/15)) ([1e652d71](https://github.com/Cadienvan/expirables/commit/1e652d718f53487274d3af661ccbe6e91ed06d19))
*  added hooks to stack + test + doc ([#14](https://github.com/Cadienvan/expirables/pull/14)) ([c0a7fcbc](https://github.com/Cadienvan/expirables/commit/c0a7fcbc7b90d9dbc75c7c126dff8072b94a828c))
*  implemented hooks system ([#12](https://github.com/Cadienvan/expirables/pull/12)) ([f058e7bc](https://github.com/Cadienvan/expirables/commit/f058e7bcbf87e536f8c9de4d949e87696d31f2cb))
* **map:**  implemented hooks + test + docs ([#18](https://github.com/Cadienvan/expirables/pull/18)) ([1d7e3de7](https://github.com/Cadienvan/expirables/commit/1d7e3de773b7069c3788836c1480856b5892a5ff))
* **set:**  implemented hooks + tests + docs ([#16](https://github.com/Cadienvan/expirables/pull/16)) ([732d0ec2](https://github.com/Cadienvan/expirables/commit/732d0ec24c2533c88cc8984847ceab3dcd0bbbe5))

##### Bug Fixes

* **timers:**  flaky test ([#10](https://github.com/Cadienvan/expirables/pull/10)) ([834da36a](https://github.com/Cadienvan/expirables/commit/834da36a27cf0ff102bec1f6b371403c3a844b99))

### 1.5.0 (2023-03-11)

##### Chores

*  export linked list ([#6](https://github.com/Cadienvan/expirables/pull/6)) ([ef374615](https://github.com/Cadienvan/expirables/commit/ef37461570936c2f64bdea53ba0edbddba2136f9))

##### Performance Improvements

* **husky:**  prepare script and command  ([#8](https://github.com/Cadienvan/expirables/pull/8)) ([f7805d2d](https://github.com/Cadienvan/expirables/commit/f7805d2d04a4f1e9f18762906426aac9c014124c))
*  improve reusable types ([#7](https://github.com/Cadienvan/expirables/pull/7)) ([fff15063](https://github.com/Cadienvan/expirables/commit/fff150635488496b5ac5cce5222c4c050ba945a6))

#### 1.4.1 (2023-01-24)

##### Tests

*  fixed flacky test ([178d8bad](https://github.com/Cadienvan/expirables/commit/178d8bad98f87b18805c5f2f0cfc69fe627aba47))

### 1.4.0 (2023-01-24)

##### Chores

* **deps:**  bump json5 from 2.2.1 to 2.2.3 ([#2](https://github.com/Cadienvan/expirables/pull/2)) ([fed3bc1a](https://github.com/Cadienvan/expirables/commit/fed3bc1ab1dd45c2ed44cf25e4d362c8ee3a63cc))

##### Documentation Changes

*  updated docs to accomodate ([c8c15c86](https://github.com/Cadienvan/expirables/commit/c8c15c8655be1cb1ea916aff62359a4c3865e07b))

##### New Features

*  added Linked List ([21bc49c8](https://github.com/Cadienvan/expirables/commit/21bc49c8a900fa0561dabd6a8f3d9eeb81f77b08))

##### Tests

*  improved coverage to 100% lines ([#4](https://github.com/Cadienvan/expirables/pull/4)) ([3ae3daa9](https://github.com/Cadienvan/expirables/commit/3ae3daa98200473b3641cd4b308048197a3c000a))

### 1.3.0 (2022-12-17)

##### Chores

*  updated package lock ([c5c7e90a](https://github.com/Cadienvan/expirables/commit/c5c7e90abd9a72eb31918e875b5562288297583b))
*  brought back previous version and changelog for compatibility ([1fe1e395](https://github.com/Cadienvan/expirables/commit/1fe1e39543a2d9befed323ae6c65ad3437e83b62))

##### Documentation Changes

*  updated changelog ([18bcd1fa](https://github.com/Cadienvan/expirables/commit/18bcd1fa66280273d75fb329c7bd95047d57b6c6))
*  updated changelog ([8a6e8e02](https://github.com/Cadienvan/expirables/commit/8a6e8e02fa424aa444596221db36b8c6b432eb82))

##### Other Changes

*  package name changed + added missing export ([6456dd18](https://github.com/Cadienvan/expirables/commit/6456dd186e30c8459b06dea8ff230d65cc2ad8d6))

### 1.3.0 (2022-12-17)

##### Chores

*  brought back previous version and changelog for compatibility ([1fe1e395](https://github.com/Cadienvan/expirables/commit/1fe1e39543a2d9befed323ae6c65ad3437e83b62))

##### Documentation Changes

*  updated changelog ([8a6e8e02](https://github.com/Cadienvan/expirables/commit/8a6e8e02fa424aa444596221db36b8c6b432eb82))

##### Other Changes

*  package name changed + added missing export ([6456dd18](https://github.com/Cadienvan/expirables/commit/6456dd186e30c8459b06dea8ff230d65cc2ad8d6))

### 1.3.0 (2022-12-17)

##### Chores

*  brought back previous version and changelog for compatibility ([1fe1e395](https://github.com/Cadienvan/expirables/commit/1fe1e39543a2d9befed323ae6c65ad3437e83b62))

##### Other Changes

*  package name changed + added missing export ([6456dd18](https://github.com/Cadienvan/expirables/commit/6456dd186e30c8459b06dea8ff230d65cc2ad8d6))

#### 1.2.2 (2022-12-12)

##### Chores

*  added automatic changelog generation ([1804d6e3](https://github.com/Cadienvan/expirables/commit/1804d6e3519bf8f4cd64cf0c81643f281ea76f2f))
