<?php

class HomeController extends Controller
{
    public function index(): void
    {
        $produtos = (new Product())->allAtivos();
        $this->view('shop/home', ['produtos' => $produtos]);
    }
}
