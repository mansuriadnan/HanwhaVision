class StateClass {
  /**
   *
   * @param {StateMachine} machine
   */
  constructor(machine) {
    this.machine = machine;
  }
  get db() {
    return this.machine.context.app.getDb();
  }
  get Module() {
    return this.machine.context.Module;
  }
  start() {}
  end() {}
}

class PointDragger extends StateClass {
  constructor(...args) {
    super(...args);

    this.onpointerdown = (dragger) => {};
    this.onpointermove = (dragger) => {};
    this.onpointerup = (dragger) => {};

    this.buttons = 1;
    this.distance = 0;
    this.start = { x: 0, y: 0, z: 0 };
    this.end = { x: 0, y: 0, z: 0 };
    this.pressed = false;

    const { context } = this.machine;
    const { app, Module } = context;
    const { OdDbCircle, OdGePoint3d, OdGeMatrix3d } = Module;
    /** @type {HTMLCanvasElement} */
    const canvas = Module.canvas;
    const device = app.getDevice();
    const view = device.viewAt(0);

    const distance = () => {
      let dx = this.end.x - this.start.x;
      let dy = this.end.y - this.start.y;
      let dz = this.end.z - this.start.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    const screenToWorld = (x, y) => {
      // const worldToDeviceMatrix = view.worldToDeviceMatrix();
      // const worldToDeviceMatrixInverse = worldToDeviceMatrix.inverse();
      // const point = new OdGePoint3d(x, y, 0);
      // point.transformBy(worldToDeviceMatrixInverse);
      // point.z = 0
      // return point;
      const point = new OdGePoint3d(x, y, 0);

      const pGsView = view;
      point.transformBy(
        pGsView.screenMatrix().mul(pGsView.projectionMatrix()).inverse()
      );
      point.z = 0;

      const xEyeToWorld = new OdGeMatrix3d();
      let yVector = pGsView.upVector().normalize();
      let zVector = pGsView
        .position()
        .asVector()
        .sub(pGsView.target().asVector())
        .normalize();
      let xVector = yVector.crossProduct(zVector);
      xEyeToWorld.setCoordSystem(pGsView.target(), xVector, yVector, zVector);

      point.transformBy(xEyeToWorld);

      return point;
    };

    /**
     *
     * @param {PointerEvent} ev
     */
    const pointermove = (ev) => {
      if (this.pressed) {
        const { x, y, z } = screenToWorld(ev.offsetX, ev.offsetY);
        this.end.x = x;
        this.end.y = y;
        this.end.z = z;
        this.distance = distance();
        this.onpointermove(this);
      }
    };

    const pointerdown = (ev) => {
      if (ev.buttons === this.buttons) {
        this.pressed = true;
        const { x, y, z } = screenToWorld(ev.offsetX, ev.offsetY);
        this.start.x = x;
        this.start.y = y;
        this.start.z = z;
        this.onpointerdown(this);
      }
    };

    const pointerup = (ev) => {
      if (this.pressed) {
        this.pressed = false;
        const { x, y, z } = screenToWorld(ev.offsetX, ev.offsetY);
        this.end.x = x;
        this.end.y = y;
        this.end.z = z;
        this.distance = distance();
        this.onpointerup(this);
        // this.end()
      }
    };

    this.start = () => {
      canvas.addEventListener("pointermove", pointermove);
      canvas.addEventListener("pointerdown", pointerdown);
      canvas.addEventListener("pointerup", pointerup);
    };

    this.end = () => {
      canvas.removeEventListener("pointermove", pointermove);
      canvas.removeEventListener("pointerdown", pointerdown);
      canvas.removeEventListener("pointerup", pointerup);
    };
  }
}

class CircleDragger extends StateClass {
  constructor(...args) {
    super(...args);
    this.pointDragger = new PointDragger(...args);
  }
  start() {
    this.pointDragger.start();

    const { context } = this.machine;
    const { app, Module } = context;
    const {
      OdDbCircle,
      OdGePoint3d,
      OpenMode,
      OdDbBlockTableRecord,
      OdGsModel,
    } = Module;

    const db = app.getDb();
    const device = app.getDevice();
    const view = device.viewAt(0);

    let pCircle;

    this.pointDragger.onpointerdown = (pointDragger) => {
      pCircle = OdDbCircle.createObject();
      pCircle.setDatabaseDefaults(db, true);
      view.add(pCircle, null);

      const { start } = pointDragger;
      let center = new OdGePoint3d(start.x, start.y, start.z);
      pCircle.setCenter(center);
      pCircle.setRadius(1);
      pCircle.setNormal(new OdGePoint3d(0, 0, 1).asVector());
      center.delete();
    };
    this.pointDragger.onpointerup = (pointDragger) => {
      view.erase(pCircle);

      const model = db
        .getModelSpaceId()
        .safeOpenObject(OpenMode.kForWrite, false);
      const pRecord = OdDbBlockTableRecord.cast(model);
      pRecord.appendOdDbEntity(pCircle);
      pCircle.delete();
      pRecord.delete();
      model.delete();
      view.invalidate();
    };
    this.pointDragger.onpointermove = (pointDragger) => {
      pCircle.setRadius(pointDragger.distance);
    };

    this.end = () => this.pointDragger.end();
  }
}

class ArcDimensionDragger extends StateClass {
  start() {
    const pDb = this.db;
    const { OpenMode, OdDbBlockTableRecord, OdGePoint3d, OdDbArcDimension } =
      this.Module;
    const pSpace = OdDbBlockTableRecord.cast(
      pDb.getModelSpaceId().safeOpenObject(OpenMode.kForWrite, false)
    );

    let center = new OdGePoint3d();
    let startPoint = new OdGePoint3d();
    let end = new OdGePoint3d();
    let arcPoint = new OdGePoint3d();

    let pDimension;

    const device = this.machine.context.app.getDevice();
    const view = device.viewAt(0);

    const queue = [center, startPoint, end, arcPoint];
    let queueIndex = 0;

    this.pointDragger = new PointDragger(this.machine);
    this.pointDragger.onpointerdown = (dragger) => {
      if (!pDimension) {
        center = new OdGePoint3d();
        startPoint = new OdGePoint3d();
        end = new OdGePoint3d();
        arcPoint = new OdGePoint3d();
        pDimension = OdDbArcDimension.createObject();
        pDimension.setDatabaseDefaults(pDb, true);
        view.add(pDimension, null);
        //  pSpace.appendOdDbEntity(pDimension);
      }
      const { start } = dragger;
      const { x, y, z } = start;
      queue[queueIndex].set(x, y, z);

      preview();
    };
    this.pointDragger.onpointerup = (dragger) => {
      const { start } = dragger;
      const { x, y, z } = start;
      queue[queueIndex].set(x, y, z);

      queueIndex = (queueIndex + 1) % queue.length;

      if (queueIndex === 0) {
        view.erase(pDimension);
        pSpace.delete();
        pDimension.delete();
        this.pointDragger.end();
        // view.invalidate()
      }
      preview();
    };
    this.pointDragger.onpointermove = (dragger) => {
      const { start } = dragger;
      const { x, y, z } = start;
      queue[queueIndex].set(x, y, z);

      preview();
    };
    this.pointDragger.start();

    function preview() {
      pDimension.setCenterPoint(center);
      pDimension.setArcPoint(arcPoint);
      pDimension.setXLine1Point(startPoint);
      pDimension.setXLine2Point(end);
      pDimension.setArcSymbolType(1);
      pDimension.recomputeDimBlock(false);
    }
  }
}

class AppContext {
  constructor(app, Module) {
    this.Module = Module;
    this.app = app;
  }
}

class StateMachine {
  /**
   *
   * @param {AppContext} context
   */
  constructor(context) {
    /** @type {AppContext} */
    this.context = context;
    /** @type {StateClass} */
    this.state = null;
  }

  /**
   *
   * @param {StateClass} state
   */
  change(state) {
    this.state && this.state.end();
    this.state = state;
    this.state && this.state.start();
  }
}
