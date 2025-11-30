USE sistema_db;
-- Desactivar chequeos temporalmente para evitar errores al crear
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


USE `sistema_db` ;

DROP TABLE IF EXISTS `sistema_db`.`Profesor` ;

CREATE TABLE IF NOT EXISTS `sistema_db`.`Profesor` (
  `id_Profesor` INT NOT NULL AUTO_INCREMENT, -- Agregado AUTO_INCREMENT
  `Nombre` VARCHAR(45) NOT NULL,
  `Email_institucional` VARCHAR(60) NOT NULL,
  `Rut` VARCHAR(60) NULL,
  `Password` VARCHAR(255) NOT NULL,
  `Activo` TINYINT NOT NULL DEFAULT 1, -- Default 1 (activo) para facilitar
  PRIMARY KEY (`id_Profesor`),
  UNIQUE INDEX `Password_UNIQUE` (`Password` ASC) VISIBLE,
  UNIQUE INDEX `Rut_UNIQUE` (`Rut` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sistema_db`.`Equipo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sistema_db`.`Equipo` ;

CREATE TABLE IF NOT EXISTS `sistema_db`.`Equipo` (
  `id_equipo` INT NOT NULL, -- Agregado AUTO_INCREMENT
  `Codigo_qr` INT NULL,
  `Tipo_equipo` VARCHAR(45) NOT NULL,
  `Descripcion` VARCHAR(200) NULL,
  `Estado` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_equipo`),
  UNIQUE INDEX `codigo_qr_UNIQUE` (`Codigo_qr` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sistema_db`.`Prestamo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sistema_db`.`Prestamo` ;

CREATE TABLE IF NOT EXISTS `sistema_db`.`Prestamo` (
  `id_Prestamo` INT NOT NULL AUTO_INCREMENT, -- Agregado AUTO_INCREMENT
  `fk_id_Profesor` INT NOT NULL,
  `fecha_solicitud` DATE NOT NULL,
  `estado` VARCHAR(15) NOT NULL,
  `fecha_devolucion` DATE NOT NULL,
  PRIMARY KEY (`id_Prestamo`),
  INDEX `fk_Prestamo_Profesor_idx` (`fk_id_Profesor` ASC) VISIBLE,
  CONSTRAINT `fk_Prestamo_Profesor`
    FOREIGN KEY (`fk_id_Profesor`)
    REFERENCES `sistema_db`.`Profesor` (`id_Profesor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `sistema_db`.`Detalle_prestamo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sistema_db`.`Detalle_prestamo` ;

CREATE TABLE IF NOT EXISTS `sistema_db`.`Detalle_prestamo` (
  `id_Detalle_prestamo` INT NOT NULL AUTO_INCREMENT, -- Agregado AUTO_INCREMENT
  `fk_id_equipo` INT NOT NULL,
  `fk_id_Prestamo` INT NOT NULL,
  `fecha_entrega` DATE NOT NULL,
  `fecha_devolucion` DATE NOT NULL,
  `estado` VARCHAR(15) NOT NULL,
  PRIMARY KEY (`id_Detalle_prestamo`),
  INDEX `fk_Detalle_prestamo_Equipo1_idx` (`fk_id_equipo` ASC) VISIBLE,
  INDEX `fk_Detalle_prestamo_Prestamo1_idx` (`fk_id_Prestamo` ASC) VISIBLE,
  CONSTRAINT `fk_Detalle_prestamo_Equipo1`
    FOREIGN KEY (`fk_id_equipo`)
    REFERENCES `sistema_db`.`Equipo` (`id_equipo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Detalle_prestamo_Prestamo1`
    FOREIGN KEY (`fk_id_Prestamo`)
    REFERENCES `sistema_db`.`Prestamo` (`id_Prestamo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- Insertar un Equipo de prueba para que la API tenga algo que mostrar
/*INSERT INTO Equipo (Codigo_qr, Tipo_equipo, Descripcion, Estado) 
VALUES (1010, 'Notebook', 'Lenovo Thinkpad T480', 'Disponible');

INSERT INTO Equipo (Codigo_qr, Tipo_equipo, Descripcion, Estado) 
VALUES (2020, 'Proyector', 'Epson HDMI', 'Prestado');*/
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (1, 1001, 'Computador', 'equipo viejo 01', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (2, 1002, 'Computador', 'equipo viejo 02', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (3, 1003, 'Computador', 'equipo viejo 03', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (4, 1004, 'Computador', 'equipo viejo 04', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (5, 1005, 'Computador', 'equipo viejo 05', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (6, 1006, 'Computador', 'equipo viejo 06', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (7, 1007, 'Computador', 'equipo viejo 07', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (8, 1008, 'Computador', 'equipo viejo 08', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (9, 1009, 'Computador', 'equipo viejo 09', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (10, 1010, 'Computador', 'equipo viejo 10', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (11, 1011, 'Computador', 'equipo viejo 11', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (12, 1012, 'Computador', 'equipo viejo 12', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (13, 1013, 'Computador', 'equipo viejo 13', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (14, 1014, 'Computador', 'equipo viejo 14', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (15, 1015, 'Computador', 'equipo viejo 15', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (16, 1016, 'Computador', 'equipo viejo 16', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (17, 1017, 'Computador', 'equipo viejo 17', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (18, 1018, 'Computador', 'equipo viejo 18', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (19, 1019, 'Computador', 'equipo viejo 19', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (20, 1020, 'Computador', 'equipo viejo 20', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (21, 1021, 'Computador', 'equipo viejo 21', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (22, 1022, 'Computador', 'equipo viejo 22', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (23, 1023, 'Computador', 'equipo viejo 23', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (24, 1024, 'Computador', 'equipo viejo 24', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (25, 1025, 'Computador', 'equipo viejo 25', 'Disponible');

-- Insertar 20 computadores nuevos
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (26, 2001, 'Computador', 'equipo nuevo 01', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (27, 2002, 'Computador', 'equipo nuevo 02', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (28, 2003, 'Computador', 'equipo nuevo 03', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (29, 2004, 'Computador', 'equipo nuevo 04', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (30, 2005, 'Computador', 'equipo nuevo 05', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (31, 2006, 'Computador', 'equipo nuevo 06', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (32, 2007, 'Computador', 'equipo nuevo 07', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (33, 2008, 'Computador', 'equipo nuevo 08', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (34, 2009, 'Computador', 'equipo nuevo 09', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (35, 2010, 'Computador', 'equipo nuevo 10', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (36, 2011, 'Computador', 'equipo nuevo 11', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (37, 2012, 'Computador', 'equipo nuevo 12', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (38, 2013, 'Computador', 'equipo nuevo 13', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (39, 2014, 'Computador', 'equipo nuevo 14', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (40, 2015, 'Computador', 'equipo nuevo 15', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (41, 2016, 'Computador', 'equipo nuevo 16', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (42, 2017, 'Computador', 'equipo nuevo 17', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (43, 2018, 'Computador', 'equipo nuevo 18', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (44, 2019, 'Computador', 'equipo nuevo 19', 'Disponible');
INSERT INTO Equipo (id_equipo, Codigo_qr, Tipo_equipo, Descripcion, Estado) VALUES (45, 2020, 'Computador', 'equipo nuevo 20', 'Disponible');

INSERT INTO Profesor (id_Profesor, Nombre, Email_institucional, Rut, Password, Activo) VALUES (1, 'Pepe Cortisona', 'Pepe.Cortisona@Unach.cl', 12345678-9, 'Condorito', 1);
INSERT INTO Profesor (id_Profesor, Nombre, Email_institucional, Rut, Password, Activo) VALUES (2, 'HuevoDuro', 'Huevo.Duro@Unach.cl', 98765432-1, 'Cone', 1);
INSERT INTO Profesor (id_Profesor, Nombre, Email_institucional, Rut, Password, Activo) VALUES (3, 'Yayita', 'Yayitaaa@Unach.cl', 2222222-5, 'HuevoDuro', 1);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;