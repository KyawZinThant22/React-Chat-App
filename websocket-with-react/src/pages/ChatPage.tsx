import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SendIcon from "../assets/SendIcon";


const ChatPage = () => {
  interface Message {
    sender: string;
    body: string;
    sendAt: number;
  }

  const [messages, setMessages] = useState<Message[] | []>([]);
  const [isConnectionOpen, setIsConnectionOpen] = useState<boolean>(false);
  const [bodyMessage, setBodyMessage] = useState<string>("");

  const { username } = useParams<{ username: string }>();


  const ws = useRef<WebSocket | null>(null);

    // Sending message function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendMessage = (e:any) => {
        e.preventDefault();
        if (bodyMessage && ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({
              sender: username,
              body: bodyMessage,
            })
          );
          setBodyMessage("");
        }
      };

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    //opening the ws connection
    ws.current.onopen = () => {
      console.log("Connection opened");
      setIsConnectionOpen(true);
    };

    //Listening on ws new added messages
    ws.current.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      setMessages((_message) => [..._message, data]);
    };

    //cleaning up
    return () => {
      console.log("Cleaning up");
      ws.current?.close();
    };
  }, []);

  console.log(messages)
  const scrollTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollTarget.current) {
      scrollTarget.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <>
     <div id="chat-view-container" className="flex flex-col w-2/3 mx-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`my-3 rounded py-3 w-1/3 text-white ${
            message.sender === username
              ? "self-end bg-purple-600"
              : "bg-blue-600"
          }`}
        >
          <div className="flex items-center">
            <div className="ml-2">
              <div className="flex flex-row">
                <div className="text-sm font-medium leading-5 text-gray-900">
                  {message.sender} at
                </div>
                <div className="ml-1">
                  <div className="text-sm font-bold leading-5 text-gray-900">
                    {new Date(message.sendAt).toLocaleTimeString(undefined, {
                      timeStyle: "short",
                    })}{" "}
                  </div>
                </div>
              </div>
              <div className="mt-1 text-sm font-semibold leading-5">
                {message.body}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={scrollTarget} />
    </div>
     <form onSubmit={sendMessage} className="w-2/3 mx-auto mt-12">
        <p>
          You are chatting as <span className="font-bold">{username}</span>
        </p>
        <div className="flex flex-row mt-6 ">
          <input
            id="message"
            type="text"
            className="w-full border-2 border-gray-200 focus:outline-none rounded-md p-2 hover:border-purple-400"
            placeholder="Type your message here..."
            value={bodyMessage}
            onChange={(e) => setBodyMessage(e.target.value)}
            required
          />
          <button
            aria-label="Send"
            type="submit"
            className="m-3"
            disabled={!isConnectionOpen}
          >
            <SendIcon/>
          </button>
        </div>
      </form>
    </>
   
  );
};

export default ChatPage;
