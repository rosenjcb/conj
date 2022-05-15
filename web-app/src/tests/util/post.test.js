import { processPostText } from "../../util/post"

test('Given simple text, should nest text inside a span', () => {
  const result = processPostText(null, "Hello world");
  expect(result.props.children.length).toEqual(1);
  expect(result.props.children[0].type === 'span');
})

test('Given post link, should set anchor tag', () => {
  const result = processPostText(200, postReply);
  expect(result.props.children.length).toEqual(3);
  expect(result.props.children[0].type === 'a');
  expect(result.props.children[0].href === '/thread/200#202');
  expect(result.props.children[1].type === 'span');
})

test('Replied Post should break new line', () => {
  const result = processPostText(200, postReply);
  expect(result.props.children[1].type === 'br');
})

test('Arrows mid line should not create anchortags', () => {
  const result = processPostText(200, middleArrow);
  expect(result.props.children[0].type === 'span');
})


const postReply = `
>>202
I disagree personally.
`

const middleArrow = `
this is not a greentext but saints > patriots
`
