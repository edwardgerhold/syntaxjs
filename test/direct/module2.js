module "b" {
    let y;
    import x from "a";
    y = x;
    export y;
}
