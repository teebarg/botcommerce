const Debugger = (props: any) => {
    return <pre>{JSON.stringify(props, null, 2)}</pre>;
};

export default Debugger;
