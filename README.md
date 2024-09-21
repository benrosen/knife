# 🔪

Knife is a practical programming language.

## Hello World

Install knife globally with npm.

```shell
$ npm i -g knife
```

Create a file with a `.k` extension; for this tutorial we will make one called `hello_world.k`.

```knife
~
hello_world.k
~

output "Hello, World!"
```

> [!INFO]
> The `~` character starts and ends multiline comments.

> [!INFO]
> The `output` keyword is synonymous with `return` in other languages.

Run your `.k` file from your terminal.

```shell
$ knife run hello_world.k
```

## Learning Knife by Example

### Output

To return a value from a Knife program, use the `output` keyword.

```knife
output "foo"
```

This program "outputs" the string `"foo"` to the console.

> [!INFO]
> The `output` keyword is synonymous with `return` in other languages.

Knife programs always produce string outputs.

The `output` keyword will automatically JSON encode any non-string values before outputting them.

### Input

Knife programs access input through the `input` keyword.

```knife
output input
```

This program outputs the input value.

For example, running the following command:

```shell
$ knife run hello_world.k bar
```

will output:

```shell
bar
```

> [!WARNING]
> You can only pass one argument to a Knife program.

Knife programs will accept any _non-null_ JSON-serializable value as input; the `input` keyword will automatically JSON decode the input value.

```knife
~
main.k
~

output input.foo
```

This program will output the value of the `foo` key in the input object.

Then, running the following command:

```shell
$ knife run main.k '{"foo": "bar"}'
```

will output:

```shell
bar
```

Since arrays are also JSON-serializable, you can pass an array as input.

```knife
~
main.k
~

output input[0]
```

This program will output the first element of the input array.

Then, running the following command:

```shell
$ knife run main.k '["foo", "bar"]'
```

will output:

```shell
foo
```

Alternatively, you can pass a JSON file path as input.

For this example, let's assume we have a file called `input.json` with the following content:

```json
{
  "foo": "bar"
}
```

Our Knife program will look like this:

```knife
~
main.k
~

output input.foo
```

Then, running the following command:

```shell
$ knife run main.k input.json
```

will output:

```shell
bar
```

### Keys

To assign a value to a key, use the `set ... to` keyword.

```knife
set foo to "bar"
```

In this example, `foo` is the name of the key and `"bar"` is the value.

> [!INFO]
> Keys are always strings.

> [!INFO]
> Any non-null JSON-serializable value can be assigned to a key.

You can access the value of a key by its name.

```knife
set foo to "bar"

output foo
```

You can also create a subscription to a key using the `watch ... as` keyword.

```knife
watch foo as foo_watcher
  output foo
```

This program will output the value of `foo` every time it is set.

To "unwatch" a key, use the `retire` keyword.

```knife
watch foo as foo_watcher
  retire foo_watcher
  output foo
```

Unlike the first program, this program will only output the value of `foo` once, scince the `foo_watcher` subscription is retired after the first change.

As another example, here's one way that you could retire a watcher after three assignments:

```knife
set foo to 0
set foo_assignments to 0

watch foo as foo_watcher
  set foo_assignments to foo_assignments plus 1

watch foo_assignments as foo_assignments_watcher
  if foo_assignments is greater than 2
	retire foo_watcher
	retire foo_assignments_watcher
```

### Operators

Knife has the following operators:

- `plus` for addition
- `minus` for subtraction
- `times` for multiplication
- `divided by` for division
- `remainder of ... when divided by` for modulo
- `is` for equality
- `is not` for inequality
- `is greater than` for greater than
- `is less than` for less than
- `is greater than or equal to` for greater than or equal to
- `is less than or equal to` for less than or equal to
- `and` for logical AND
- `or` for logical OR
- `not` for logical NOT

### Strings

Strings are enclosed in double quotes.

You can concatenate strings with the `plus` operator.

```knife
set foo to "foo"
set foobar to foo plus "bar"
```

You can remove substrings from a string with the `minus` operator.

```knife
set foobar to "foobar"
set foo to foobar minus "bar"
```

You can access substrings by their index.

```knife
set foobar to "foobar"
set first_char to foobar[0]
```

> [!INFO]
> String indices are zero-based.

You can get the length of a string with the `number of characters in` operator.

```knife
set foobar to "foobar"
set length to number of characters in foobar
```

You can split a string into an array with the `divided by` operator.

```knife
set foobar to "foo bar"
set words to foobar divided by " "

output words
```

This program will output `["foo", "bar"]`.

You can also use a regular expression to match a string.

```knife
set foobar to "foobar"
output foobar matches "^foo"
```

This program will output `true` because `"foobar"` starts with `"foo"`.

### JSON

You can encode and decode JSON objects with the `encoded` and `decoded` keywords respectively.

```knife
set encoded_obj to encoded {"foo": "bar"}
set obj to decoded encoded_obj

output obj.foo
```

This program will output `bar`.

### Arrays

Set an empty array like this:

```knife
set items to []
```

Set an array with values like this:

```knife
set items to ["foo", "bar"]
```

You can access values in an array by their index.

```knife
set items to ["foo", "bar"]
set first_item to items[0]
```

> [!INFO]
> Array indices are zero-based.

You can get the length of an array with the `number of items in` operator.

```knife
set items to ["foo", "bar"]
set length to number of items in items
```

### Objects

Set an empty object like this:

```knife
set obj to {}
```

Set an object with key-value pairs like this:

```knife
set obj to {"foo": "bar"}
```

You can do multiline object assignments like this:

```knife
set obj to {
  "foo": "bar",
  "baz": "qux"
}
```

You can access values in an object by their key.

```knife
set obj to {"foo": "bar"}
output obj.foo
```

You can get the keys of an object with the `keys` operator.

```knife
set item to {
  "foo": "bar",
  "baz": "qux"
}

output item keys
```

This program will output `["foo", "baz"]`.

You can get the values of an object with the `values` operator.

```knife
set item to {
  "foo": "bar",
  "baz": "qux"
}

output item values
```

This program will output `["bar", "qux"]`.

### Time

You can get the current epoch timestamp with the `now` keyword.

```knife
output now
```

### Randomization

You can generate a random number between 0 and 1 with the `random` keyword.

```knife
output random
```


### Functions

In Knife, each file is a function.

```knife
~
increment.k
~

output input plus 1
```

This function lives in a file called `increment.k` and outputs the input value plus one.

To import a function from another file, use the `use` keyword.

```knife
~
main.k
~

use increment
	output increment 1
```

> [!NOTE]
> If we run `main.k`, it will output `2`.

> [!INFO]
> Only code in the `use` block has access to the imported function.

You can import multiple functions by separating them with commas.

```knife
use increment, decrement
```

You can alias imports with the `as` keyword.

```knife
use increment as plus_one
	output plus_one 1
```

You can dynamically import a function using a combination of `input` and `use`.

```knife
~
main.k
~

use input as callback
	output callback 1
```

> [!WARNING] Calling `use input` without aliasing it will overwrite the `input` keyword.

This program will import the function whose name is passed as an argument.

```shell
$ knife run main.k increment
```

Running this command will output `2`. On the other hand, running this command:

```shell
$ knife run main.k decrement
```

will output `0`.

Sometimes you may want to know about the invocation history of a function, like how many times it has been called or what input it was last called with.

You can create a "history" for a function with the `use ... with` keyword.

```knife
use increment with increment_history
	set result to increment 1
	set result to increment result

	if number of items in increment_history is not 2
		output "increment_history should have two items since the increment function was called twice"
```

If you want to use an alias _and_ a history for your imported function, you can do so with the `use ... as ... with` keyword.

```knife
use increment as plus_one with plus_one_history
```

### Conditionals

To create a conditional, use the `if` and `otherwise` keywords.

```knife
if input is "foo"
  output "bar"
otherwise
  output "baz"
```

### Loops

To create a loop, use the `while` keyword.

```knife
set number to 0
set sum to 0

while number is less than or equal to 10
  set sum to sum plus number
  set number to number plus 1

output sum
```

This program will sum the numbers from 0 to 10 and output the result.

### Comments

To create a single-line comment, use the `~` character.

```knife
~ This is a comment
```

To create a multiline comment, use the `~` character before the first line of the comment and after the last line of the comment.

Multiline comments support Markdown syntax.

```knife
~
# Multiline Comments

To create a multiline comment, use the `~` character before the first line of the comment and after the last line of the comment.
~
```

### Error Handling

Knife does not have special keywords for error handling.

> [!TIP]
> Use conditionals to check for errors.

### Parallelism

Normally, Knife programs run sequentially.

Use the `concurrently` keyword to run lines in parallel.

```knife
set a to 0
set b to 0

when a is set
  output a

when b is set
  output b

concurrently
  set a to a plus 1
  set b to b plus 2
```

This program will (intentionally) induce a race condition, outputting either `1` or `2` depending on which key is set faster.

### Logging

Knife does not have special keywords for logging.

Instead, you're encouraged to decide on your own logging strategy.

One approach is to pass an array of log messages to your functions, which then return the array with additional log messages.

When your program finishes, its final output will contain all the log messages from the execution.

```knife
~
increment.k
~

set logger to input.logger

output {
  "result": input.value plus 1,
  "logger": logger plus ["incremented value from
}
```

### Testing

You don't need any special keywords to start writing basic tests in Knife.

In this example, we'll define and test a `double` function.

```knife
~
double.k
~

output input times 2
```

```knife
~
test_double.k
~

use double
	if double 2 is not 4
		output "double 2 should be 4"
```

We can run this test like any other Knife program.

```shell
$ knife run test_double.k
```

You can import tests like any other function.

```knife
use test_double
```

Like all other Knife programs, tests output strings.

```knife
use test_double
	output test_double
```

> [!NOTE]
> This program will output the result of the `test_double` function.

You can parallelize tests like any other function calls.

```knife
set test_results to []

when test_results is set
	if number of items in test_results is 2
		output test_results

use test_double, test_triple
	concurrently
		set test_results to test_results plus [test_double]
		set test_results to test_results plus [test_triple]
```

> [!NOTE]
> This program will run the `test_double` and `test_triple` functions in parallel and then output the results when both tests are complete.
