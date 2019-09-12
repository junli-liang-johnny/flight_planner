function hello() {
  console.log('hello');
}

const helloList = [
  hello,
  hello
];

helloList.forEach(func => {
  func();
});
