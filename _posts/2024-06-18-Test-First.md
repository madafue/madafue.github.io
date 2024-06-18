---
layout: post
title: The First
---

So I have a blog now. That's pretty cool, isn't it?

I will establish now that this beginning post is merely a test. I am writing this in Markdown (.md) format, and as such, would like to trial all of its capabilities, hopefully as future reference for additional articles. 

Yes, this is boring and honestly pretty common knowledge nowadays. Trust me, future posts will go much, *much* further in depth than this excuse for an introduction.

# Headings!

## Aren't they pretty cool?

### I'm not trying all 6. You get the picture. 


Now I have a fancy underline for this section.
======

And I can use *emphasis.* Just like **this**. ~~But not this.~~

1. Hey look, here's an ordered list.
2. Unsurprisingly, the order keeps going.
- Until it doesn't! Bullet points do, in fact, exist.


[What about an in-line link?](https://madafue.github.io "Go back Home")

Let's get fancy now. Have an image:

![alt text](https://raw.githubusercontent.com/madafue/madafue.github.io/master/images/9052679.png "What a great picture!")

And now for everyone's favourite part: programming! This is definitely a feature I'll use often. 

```python
# Meet the friendly greeter
class Greeter:
    def __init__(self, message):
        self.message = message
    
    def say_hello(self):
        print(f"👋 {self.message} 🌍")

hello_message = "Hello, World!"

# Create a Greeter instance
friendly_greeter = Greeter(hello_message)

# Let the Greeter say hello
friendly_greeter.say_hello()
```

But who uses Python for anything, am I right? *I'm sure that's not foreshadowing at all.* Markdown can also let me write in my native language of Java. 

```java
// Meet the friendly greeter
class Greeter {
    private String message;

    public Greeter(String message) {
        this.message = message;
    }

    public void sayHello() {
        System.out.println("👋 " + message + " 🌍");
    }
}

public class HelloWorld {
    public static void main(String[] args) {
    
        String helloMessage = "Hello, World!";

        Greeter greeter = new Greeter(helloMessage);

        greeter.sayHello();
    }
}
```

That should do for my purposes, using Markdown. Hopefully soon, I'll write a *real* post. For all intents and purposes, this is nothing but a placeholder. Thank you for bearing with me. 
