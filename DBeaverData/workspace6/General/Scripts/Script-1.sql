create table Flower (
	f_name varchar(100) UNIQUE NOT null primary key,
	f_color varchar(10) NOT NULL,
	price int NOT NULL
);

create table pot (
	f_name varchar(100),
	serial_code INT PRIMARY key,
	p_color varchar(10),
	p_form varchar(100),
	
	CONSTRAINT fk_pot_flower
		FOREIGN KEY (f_name) REFERENCES Flower(f_name)
);

ALTER TABLE pot
RENAME COLUMN p_form TO p_shape;

-- grant references on academy_db.* to 'app_user'

-- 쇼핑몰 데이터베이스
-- 회원정보는 id, pw, 이름, 주소, 이메일, 생일정보
-- 상품은 상품번호, 상품명, 가격, 재고
-- 주문은 주문번호, 주문일, id, 상품번호

CREATE TABLE member (
    id VARCHAR(20) PRIMARY KEY,
    pw VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(200),
    email VARCHAR(100) UNIQUE,
    birthday DATE
);

CREATE TABLE product (
    pd_number VARCHAR(20) PRIMARY KEY,
    pd_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock INT
);

CREATE TABLE orders (
    od_number INT PRIMARY KEY,
    pd_number VARCHAR(20) NOT NULL,
    id VARCHAR(20) NOT NULL,
    od_date DATE NOT NULL,
    
    CONSTRAINT fk_orders_product
    	FOREIGN KEY (pd_number) REFERENCES product(pd_number),
    CONSTRAINT fk_orders_member
    	FOREIGN KEY (id) REFERENCES member(id)
);


