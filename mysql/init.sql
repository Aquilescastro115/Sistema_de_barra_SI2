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
  `id_equipo` INT NOT NULL AUTO_INCREMENT, -- Agregado AUTO_INCREMENT
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

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;