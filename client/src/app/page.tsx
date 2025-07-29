import ApolloWrapper from "./components/ApolloProvider";

export default function Home() {
  return (
    <ApolloWrapper>
      <div className="bg-black font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        root page
      </div>
    </ApolloWrapper>
  );
}
