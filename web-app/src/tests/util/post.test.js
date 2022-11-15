import { PostLink, processPostText, Root, GreenText } from "../../util/post";

test("Given simple text, should nest text inside a span", () => {
  const result = processPostText(null, "Hello world");
  const expected = (
    <Root>
      <span>Hello world</span>
    </Root>
  );
  expect(result.toString()).toEqual(expected.toString());
});

test("Given post link, should set anchor tag", () => {
  const result = processPostText(200, postReply);
  const expected = (
    <Root>
      <PostLink href="200#202">#202</PostLink>
      <span>I disagree personally.</span>
    </Root>
  );

  expect(result.toString()).toEqual(expected.toString());
});

test("Post should break new line", () => {
  const result = processPostText(200, postReplyWithBreak);
  const expected = (
    <Root>
      <span>hello world</span>
      <br />
      <span>there is a blank line between these two statements.</span>
      <span>but not between this one and the one below</span>
    </Root>
  );
  expect(result.toString()).toEqual(expected.toString());
});

test("Arrows mid line should not create green text", () => {
  const result = processPostText(200, middleArrow);
  const expected = (
    <Root>
      <span>this is not a greentext but saints > patriots</span>
    </Root>
  );
  expect(result.toString()).toEqual(expected.toString());
});

test("Arrows beginning of line should create green text", () => {
  const result = processPostText(200, beginningArrow);
  const expected = (
    <Root>
      <GreenText>{">"}this is a greentext</GreenText>
    </Root>
  );
  expect(result.toString()).toEqual(expected.toString());
});

const postReply = `#202
I disagree personally.`;

const postReplyWithBreak = `hello world

there is a blank line between these two statements.
but not between this one and the one below`;

const beginningArrow = `>this is a greentext`;

const middleArrow = `this is not a greentext but saints > patriots`;
