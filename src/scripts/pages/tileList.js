import jQuery from "jquery";
import GrooveBoard from "../GrooveBoard";
const $ = jQuery;

import { GridStack } from "gridstack";
window.GridStack = GridStack;
const tileListInnerContainer = document.querySelector(
  "div.tile-list-inner-container"
);
const grid = GridStack.init({
  column: 4,
  disableResize: true,
  disableDrag: true,
  float: false,
  animate: false,
  margin: "10px",
});
grid.on("dragstart", function (event, el) {
  // el.classList.add("grid-dragging")
  setTimeout(() => {
    scrollers.tile_page_scroller.scrollTo(null);
  }, 1000);
});
grid.on("dragstop", function (event, el) {
  setTimeout(() => {
    GrooveBoard.backendMethods.homeConfiguration.save()
  }, 500);
  //$("div.groove-home-tile.grid-dragging").removeClass("grid-dragging").css("transition", "")
});
window.tileListGrid = grid;
var homeTileEditEnabled = false;
const homeTileEditSwitch = {
  on: (immediate = false, callback = () => {}) => {
    GrooveBoard.backendMethods.navigation.push(
      "homeTileMenuOn",
      () => {},
      homeTileEditSwitch.off
    );
    scrollers.main_home_scroller.enabled = false;
    homeTileEditEnabled = true;
    tileListGrid.enableMove(true);
    $("div.groove-home-tile").removeClass("home-menu-selected");
    $("div.tile-list-page").addClass("home-menu-back-intro");
    if (immediate) {
      $("div.tile-list-page")
        .addClass("home-menu-back")
        .removeClass("home-menu-back-intro");
      if (callback && typeof callback == "function") callback();
      shakeDistanceModifier.on();
    } else {
      window.homeTileMenuCreationSecondTimeout = setTimeout(() => {
        $("div.tile-list-page")
          .addClass("home-menu-back")
          .removeClass("home-menu-back-intro");
        if (callback && typeof callback == "function") callback();
        shakeDistanceModifier.on();
      }, 500);
    }
  },
  off: (immediate) => {
    GrooveBoard.backendMethods.navigation.invalidate("homeTileMenuOn");
    shakeDistanceModifier.off();
    $("div.groove-home-tile").removeClass("home-menu-selected");

    $("div.tile-list-page").addClass("home-menu-back-outro");
    scrollers.main_home_scroller.enabled = true;
    homeTileEditEnabled = false;
    tileListGrid.enableMove(false);
    clearTimeout(window.homeTileMenuCreationFirstTimeout);
    clearTimeout(window.homeTileMenuCreationSecondTimeout);
    $("div.groove-home-menu").remove();

    $("div.tile-list-page").removeClass("home-menu-back home-menu-back-intro");
    window.homeTileMenuDestroyTimeout = setTimeout(() => {
      homeTileMenuClean();
      $("div.tile-list-page").removeClass("home-menu-back-outro");
    }, 500);
  },
};
const shakeDistanceModifier = {
  on: () => {
    $({ someValue: 0 }).animate(
      { someValue: 5 },
      {
        duration: 200,
        step: function () {
          $("body").css("--shake-distance", this.someValue / 1.5 + "px");
          $("body").css(
            "--shake-scale-distance",
            (1 - this.someValue / 5) * 0.05 + 0.95
          );
        },
      }
    );
  },
  off: () => {
    $({ someValue: 5 }).animate(
      { someValue: 0 },
      {
        duration: 100,
        step: function () {
          $("body").css("--shake-distance", this.someValue / 1.5 + "px");
          $("body").css(
            "--shake-scale-distance",
            (1 - this.someValue / 5) * 0.05 + 0.95
          );
        },
      }
    );
  },
};

window.homeTileEditSwitch = homeTileEditSwitch;

$("#app-page-icon").on("flowClick", function () {
  window.scrollers.main_home_scroller.scrollTo(-window.innerWidth, 0, 500);
});

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    GrooveBoard.backendMethods.scaleTiles();
    scrollers.tile_page_scroller.refresh();
  }
});
resizeObserver.observe(document.querySelector("div.tile-list-inner-container"));

$(window).on("click", function (e) {
  if (
    e.target.classList.contains("groove-home-tile") &&
    !e.target.classList.contains("groove-letter-tile")
  ) {
    if ($("div.tile-list-page").hasClass("home-menu-back")) {
      $("div.groove-home-tile").removeClass("home-menu-selected");
      e.target.classList.add("home-menu-selected");
      GrooveBoard.boardMethods.createTileMenu(e.target);
    } else if (e.target.canClick) {
      e.target.classList.add("app-transition-selected");
      appTransition.onPause();
      setTimeout(() => {
        Groove.launchApp(e.target.getAttribute("packageName"));
      }, 1000);
    }
  } else if (
    e.target ==
      document.querySelector("#main-home-slider > div > div:nth-child(1)") ||
    e.target.classList.contains("tile-list-container") ||
    e.target.classList.contains("home-menu-back") ||
    e.target.classList.contains("home-menu-back-intro") ||
    e.target.classList.contains("app-page-icon-banner")
  ) {
    //  if (homeTileEditEnabled) homeTileEditSwitch.off()
  }
});

$(window).on("pointerdown", function (e) {
  if (e.target.classList.contains("groove-home-tile") && !homeTileEditEnabled) {
    e.target.canClick = true;
    e.target.homeTileMenuState = false;
    e.target.appRect = e.target.getBoundingClientRect();
    clearTimeout(window.homeTileMenuCreationFirstTimeout);
    clearTimeout(window.homeTileMenuCreationSecondTimeout);
    $("div.groove-home-menu").remove();
    window.homeTileMenuCreationFirstTimeout = setTimeout(() => {
      e.target.canClick = false;

      homeTileEditSwitch.on(false, () => {
        e.target.classList.add("home-menu-selected");
        GrooveBoard.boardMethods.createTileMenu(e.target);
        generateShakeAnimations();
        e.target.homeTileMenuState = true;
        setTimeout(() => {
          $(e.target).trigger(
            "mousedown",
            Object.assign(e, { target: e.target })
          );
        }, 1000);
      });
      e.target.classList.add("home-menu-selected");
    }, 500);
  } else if (
    e.target.classList.contains("groove-home-tile") &&
    homeTileEditEnabled
  ) {
    $("div.groove-home-tile").removeClass("home-menu-selected");
    e.target.classList.add("home-menu-selected");
    GrooveBoard.boardMethods.createTileMenu(e.target);
  }
});
$(
  "#main-home-slider > div > div.slide-page, #main-home-slider > div > div.slide-page > div.inner-page, #main-home-slider > div > div.slide-page > div.inner-page > div.tile-list-container, div.tile-list-inner-container"
).on("flowClick", () => {
  if (homeTileEditEnabled) homeTileEditSwitch.off();
});
$(window).on("pointerup", function (e) {
  $("div.groove-home-tile").each((index, element) => {
    if (element["homeTileMenuState"] == false) {
      if (element["homeTileMenu"]) element["homeTileMenu"].remove();
      delete element["homeTileMenuState"];
      delete element["homeTileMenu"];
      delete element["appRect"];
      homeTileEditSwitch.off();
    } else if (element["homeTileMenuState"] == true) {
    }
  });
});

function homeTileMenuClean() {
  document.querySelectorAll(".groove-tile-menu").forEach((i) => i.remove());
  // GrooveBoard.backendMethods.navigation.invalidate("homeTileMenuOn")
  $("div.groove-home-tile").removeClass("home-menu-selected");
  clearTimeout(window.homeTileMenuCreationFirstTimeout);
  clearTimeout(window.homeTileMenuCreationSecondTimeout);
  $("div.tile-list-page").removeClass("home-menu-back-intro home-menu-back");
}
function appImmediateClose() {
  $("div.groove-home-tile").each((index, element) => {
    if (element["homeTileMenuState"] == false) {
      if (element["homeTileMenu"]) element["homeTileMenu"].remove();
      delete element["homeTileMenuState"];
      delete element["appRect"];
      homeTileMenuClean();
    } else if (element["homeTileMenuState"] == true) {
    }
  });
}

$(window).on("finishedLoading", () => {
  scrollers.tile_page_scroller.scroller.animater.hooks.on(
    "time",
    (duration) => {
      tileListInnerContainer.style.setProperty("--wallpaper-scroll-duration", duration + "ms")
    }
  );
  scrollers.tile_page_scroller.scroller.translater.hooks.on(
    "beforeTranslate",
    (point,ee) => {
      GrooveBoard.backendMethods.wallpaper.recalculateOffsets(ee);
    }
  );

  //GrooveBoard.backendMethods.wallpaper.load("./assets/wallpaper.jpg")
});

